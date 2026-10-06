import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computed = "sha256=" + Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
  return computed === signature;
}

function formatPushMessage(payload: Record<string, unknown>): string {
  const commits = (payload.commits as Array<Record<string, unknown>>) ?? [];
  const pusher = (payload.pusher as Record<string, string>)?.name ?? "Alguém";
  const ref = (payload.ref as string) ?? "";
  const branch = ref.replace("refs/heads/", "");
  const repo = ((payload.repository as Record<string, unknown>)?.full_name as string) ?? "";

  const lines: string[] = [
    `**Push no GitHub** por ${pusher} em \`${branch}\` (${repo})`,
    "",
  ];

  if (commits.length === 0) {
    lines.push("Nenhum commit novo.");
  } else {
    lines.push(`**${commits.length} commit(s):**`);
    for (const c of commits.slice(0, 10)) {
      const sha = (c.id as string).slice(0, 7);
      const msg = (c.message as string).split("\n")[0];
      lines.push(`- \`${sha}\` ${msg}`);
    }
    if (commits.length > 10) {
      lines.push(`- ... e mais ${commits.length - 10} commit(s)`);
    }
  }

  const added = commits.reduce((acc, c) => acc + ((c.added as string[])?.length ?? 0), 0);
  const modified = commits.reduce((acc, c) => acc + ((c.modified as string[])?.length ?? 0), 0);
  const removed = commits.reduce((acc, c) => acc + ((c.removed as string[])?.length ?? 0), 0);

  if (added + modified + removed > 0) {
    lines.push("", `Arquivos: +${added} modificados: ${modified} removidos: ${removed}`);
  }

  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const submissionId = url.searchParams.get("submission_id");

    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: "submission_id query param required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("id, webhook_secret, pending_commits")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!submission.webhook_secret) {
      return new Response(
        JSON.stringify({ error: "Webhook not enabled for this submission" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.text();
    const signature = req.headers.get("x-hub-signature-256") ?? "";

    const valid = await verifySignature(body, signature, submission.webhook_secret);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const event = req.headers.get("x-github-event") ?? "push";
    if (event === "ping") {
      return new Response(
        JSON.stringify({ ok: true, message: "Webhook connected!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (event !== "push") {
      return new Response(
        JSON.stringify({ ok: true, message: `Event '${event}' ignored` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = JSON.parse(body);
    const message = formatPushMessage(payload);
    const pusherName = (payload.pusher as Record<string, string>)?.name ?? "GitHub";
    const commits = (payload.commits as Array<unknown>) ?? [];
    const compareUrl = (payload.compare as string) ?? null;

    const { error: insertError } = await supabase
      .from("submission_updates")
      .insert({
        submission_id: submissionId,
        author_name: pusherName,
        author_role: "github",
        message: compareUrl ? `${message}\n\n[Ver diff no GitHub](${compareUrl})` : message,
        files: [],
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to create update", detail: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabase.rpc("increment_pending_commits", {
      p_submission_id: submissionId,
      p_count: commits.length,
    }).then(({ error: rpcError }) => {
      if (rpcError) {
        // fallback: direct update
        return supabase
          .from("submissions")
          .update({ pending_commits: (submission.pending_commits ?? 0) + commits.length })
          .eq("id", submissionId);
      }
    });

    return new Response(
      JSON.stringify({ ok: true, message: "Push event recorded" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", detail: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

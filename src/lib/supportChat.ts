import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { ChatMessage } from '../types';

async function extractErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch {
      // fall through to generic message below
    }
  }
  return error instanceof Error ? error.message : 'Could not reach support right now.';
}

export async function sendSupportMessage(messages: ChatMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('support-chat', {
    body: {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    },
  });

  if (error) {
    throw new Error(await extractErrorMessage(error));
  }
  if (!data?.reply || typeof data.reply !== 'string') {
    throw new Error('Support did not return a reply.');
  }

  return data.reply;
}

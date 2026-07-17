import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AiSuggestion, BucketCategory, DateEntry } from '../types';

const MAX_PAST_DATES = 8;

interface PastDateSummary {
  title: string;
  activity: string;
  rating?: number;
}

interface AskConciergeParams {
  pastDates: DateEntry[];
  checkedCategories: BucketCategory[];
  freeText?: string;
  count?: number;
}

function summarizePastDates(pastDates: DateEntry[]): PastDateSummary[] {
  // pastDates is already sorted newest-first by DatesContext.
  return pastDates.slice(0, MAX_PAST_DATES).map((d) => {
    const primaryStop = d.stops[0];
    const rating = d.stops.find((s) => typeof s.rating === 'number')?.rating;
    return {
      title: d.title,
      activity: primaryStop?.activity ?? 'surprise',
      rating,
    };
  });
}

async function extractErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch {
      // fall through to generic message below
    }
  }
  return error instanceof Error ? error.message : 'Could not reach the AI Concierge.';
}

export async function askConcierge({
  pastDates,
  checkedCategories,
  freeText,
  count = 4,
}: AskConciergeParams): Promise<AiSuggestion[]> {
  const { data, error } = await supabase.functions.invoke('ai-concierge', {
    body: {
      pastDates: summarizePastDates(pastDates),
      checkedCategories,
      freeText: freeText?.trim() || undefined,
      count,
    },
  });

  if (error) {
    throw new Error(await extractErrorMessage(error));
  }
  if (!data?.suggestions || !Array.isArray(data.suggestions)) {
    throw new Error('The AI Concierge did not return any ideas.');
  }

  return data.suggestions.map((s: AiSuggestion, i: number) => ({
    clientId: `${Date.now()}-${i}`,
    title: s.title,
    description: s.description,
    suggestedActivity: s.suggestedActivity,
    suggestedCategory: s.suggestedCategory,
  }));
}

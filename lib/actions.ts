// app/results/actions.ts
'use server'

import { cookies } from 'next/headers';
import type { AIResponse } from './generate';

export async function fetchResult(): Promise<{ success: boolean; data?: AIResponse; error?: string }> {
  try {
    // Find the AI result cookie
    const cookieStore = await cookies();
    const resultCookies = cookieStore.getAll().filter(cookie => 
      cookie.name.startsWith('ai_result_')
    );
    
    if (resultCookies.length === 0) {
      return { 
        success: false, 
        error: 'No tier list found. Please create a new one.' 
      };
    }
    
    // Get the most recent result
    const latestCookie = resultCookies.sort((a, b) => 
      // Sort by cookie creation time, newest first
      (b.name > a.name ? 1 : -1)
    )[0];
    
    // Parse the cookie value
    const resultData = JSON.parse(latestCookie.value) as AIResponse;
    
    // Delete the cookie after reading (one-time use)
    // (await
    //       // Delete the cookie after reading (one-time use)
    //       cookies()).delete(latestCookie.name);
    
    return {
      success: true,
      data: resultData
    };
  } catch (error) {
    console.error('Error fetching tier list result:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve tier list'
    };
  }
}
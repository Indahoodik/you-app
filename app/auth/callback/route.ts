import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      'https://klqwforgbmtpcsewrbnz.supabase.co',
      'sb_publishable_-mb_QalvqVcQTX2Z9Zfb1w_IQuBjYBf'
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/', request.url))
}
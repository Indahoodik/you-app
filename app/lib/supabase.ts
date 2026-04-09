import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://klqwforgbmtpcsewrbnz.supabase.co'
const supabaseKey = 'sb_publishable_-mb_QalvqVcQTX2Z9Zfb1w_IQuBjYBf'

export const supabase = createClient(supabaseUrl, supabaseKey)
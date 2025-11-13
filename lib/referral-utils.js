import { supabase } from './supabase';

/**
 * Simpan referral tracking saat user register
 * @param {string} newUsername - Username user baru yang baru register
 * @param {string} referrerUsername - Username yang refer (dari cookie)
 */
export async function trackReferral(newUsername, referrerUsername) {
  try {
    // Validasi: pastikan referrer ada dan bukan diri sendiri
    if (!referrerUsername || referrerUsername === newUsername) {
      return { success: false, message: 'Invalid referrer' };
    }

    // Cek apakah referrer valid (user exist)
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', referrerUsername)
      .single();

    if (!referrerProfile) {
      return { success: false, message: 'Referrer not found' };
    }

    // Insert ke referral_tracking
    const { data, error } = await supabase
      .from('referral_tracking')
      .insert([
        {
          referrer_username: referrerUsername,
          referred_username: newUsername,
          conversion_status: 'converted_free',
          converted_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error tracking referral:', error);
      return { success: false, error };
    }

    // Berikan fee 30% untuk free user (asumsi nilai default Rp 10,000)
    const freeUserValue = 10000; // Nilai default untuk free user
    const feeAmount = freeUserValue * 0.30; // 30%

    await recordReferralEarning(
      referrerUsername,
      newUsername,
      'Free',
      feeAmount,
      30
    );

    return { success: true, data };
  } catch (error) {
    console.error('Error in trackReferral:', error);
    return { success: false, error };
  }
}

/**
 * Record earning dari referral
 * @param {string} referrerUsername 
 * @param {string} referredUsername 
 * @param {string} plan - "Free" atau "Pro"
 * @param {number} amount 
 * @param {number} percentage 
 */
export async function recordReferralEarning(
  referrerUsername,
  referredUsername,
  plan,
  amount,
  percentage
) {
  try {
    const { data, error } = await supabase
      .from('referral_earnings')
      .insert([
        {
          referrer_username: referrerUsername,
          referred_username: referredUsername,
          referred_plan: plan,
          earning_amount: amount,
          earning_percentage: percentage,
          status: 'pending',
          notes: `Referral earning from ${referredUsername} (${plan} plan)`
        }
      ])
      .select();

    if (error) {
      console.error('Error recording earning:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in recordReferralEarning:', error);
    return { success: false, error };
  }
}

/**
 * Process upgrade to Pro - berikan fee 50% ke referrer
 * @param {string} username - User yang upgrade
 * @param {number} proPrice - Harga paket Pro
 */
export async function processProUpgradeReferral(username, proPrice = 100000) {
  try {
    // Cek apakah user ini punya referrer
    const { data: referralData } = await supabase
      .from('referral_tracking')
      .select('referrer_username, conversion_status')
      .eq('referred_username', username)
      .single();

    if (!referralData) {
      return { success: false, message: 'No referrer found' };
    }

    // Kalau sudah pernah converted_pro, skip
    if (referralData.conversion_status === 'converted_pro') {
      return { success: false, message: 'Already processed pro upgrade' };
    }

    const referrerUsername = referralData.referrer_username;
    const feeAmount = proPrice * 0.50; // 50% untuk Pro

    // Update status di referral_tracking
    await supabase
      .from('referral_tracking')
      .update({ 
        conversion_status: 'converted_pro',
        converted_at: new Date().toISOString()
      })
      .eq('referred_username', username);

    // Record earning
    await recordReferralEarning(
      referrerUsername,
      username,
      'Pro',
      feeAmount,
      50
    );

    return { 
      success: true, 
      referrer: referrerUsername, 
      amount: feeAmount 
    };
  } catch (error) {
    console.error('Error in processProUpgradeReferral:', error);
    return { success: false, error };
  }
}

/**
 * Get referral stats untuk dashboard
 * @param {string} username 
 */
export async function getReferralStats(username) {
  try {
    // Total referred users
    const { data: referred, count: totalReferred } = await supabase
      .from('referral_tracking')
      .select('*', { count: 'exact' })
      .eq('referrer_username', username);

    // Total earnings
    const { data: earnings } = await supabase
      .from('referral_earnings')
      .select('earning_amount')
      .eq('referrer_username', username);

    const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.earning_amount), 0) || 0;

    // Pro conversions
    const proCount = referred?.filter(r => r.conversion_status === 'converted_pro').length || 0;

    return {
      totalReferred: totalReferred || 0,
      proConversions: proCount,
      totalEarnings,
      referredUsers: referred || []
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      totalReferred: 0,
      proConversions: 0,
      totalEarnings: 0,
      referredUsers: []
    };
  }
}

/**
 * Get referral code dari cookie (client-side)
 */
export function getReferralCodeFromCookie() {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const referralCookie = cookies.find(c => c.trim().startsWith('referral_code='));
  
  if (referralCookie) {
    return referralCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Clear referral cookie setelah digunakan
 */
export function clearReferralCookie() {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'referral_code=; path=/; max-age=0';
}
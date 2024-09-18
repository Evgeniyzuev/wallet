interface ReferralData {
    // make a map {userId:  referrerId}
    referrals: { [userId: string]: string }
  }
  
  const storage: ReferralData = {
    referrals: {}
  };
  
  export function saveReferral(userId: string, referrerId: string) {
// если в referrals нет userId, то добавляем его и присваиваем referrerId
    if (!storage.referrals[userId]) {
      storage.referrals[userId] = referrerId;
    }
  }
  
  export function getReferrals(userId: string): string[] {
    // создаем массив referrals 
    const referrals = [];
    for (const [key, value] of Object.entries(storage.referrals)) {
      if (value === userId) {
        referrals.push(key);
      }
    }
    return referrals;
  }
  
  export function getReferrer(userId: string): string | null {
    return storage.referrals[userId] || null;
  }
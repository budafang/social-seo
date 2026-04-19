export const ALGORITHM_KEYWORDS = [
  // Tier 1 (生死核心)
  { id: 't1_1', name: '停留時間', tier: 1, synonyms: ['看多久', '觀看時間', '看很久', '停留'] },
  // Tier 2 (機器看懂)
  { id: 't2_1', name: '前三秒抓眼球', tier: 2, synonyms: ['前三秒', '開頭', '吸睛', '鉤子'] },
  // Tier 3 (長期指標)
  { id: 't3_1', name: '大帳號推薦', tier: 3, synonyms: ['網紅標記', '被tag', '權威推薦'] }
];

/**
 * 模糊比對邏輯：
 * 傳入一個字串，檢查該字串是否「包含」在標準名稱或同義詞中，或這些詞被包含在輸入中。
 * @param {string} input - 學生輸入的字詞
 * @returns {object|null} - 回傳對應到的關鍵字物件，若無符合則回傳 null
 */
export const findMatchedKeyword = (input) => {
  if (!input || input.trim() === '') return null;
  
  const formattedInput = input.trim().toLowerCase();

  for (const keyword of ALGORITHM_KEYWORDS) {
    // 檢查是否完全一樣或是互相包含
    const nameMatch = formattedInput.includes(keyword.name.toLowerCase()) || 
                      keyword.name.toLowerCase().includes(formattedInput);
    if (nameMatch) {
      return keyword;
    }

    // 檢查同義詞
    for (const syn of keyword.synonyms) {
      const synMatch = formattedInput.includes(syn.toLowerCase()) || 
                       syn.toLowerCase().includes(formattedInput);
      if (synMatch) {
        return keyword;
      }
    }
  }

  return null;
};

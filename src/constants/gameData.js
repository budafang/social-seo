export const ALGORITHM_KEYWORDS = [
  // Tier 1: 決定生死的核心數據
  { id: 't1_1', name: '停留時間', tier: 1, synonyms: ['看多久', '觀看時間', '停留', '停留時長'] },
  { id: 't1_2', name: '完播率', tier: 1, synonyms: ['看完', '看到最後', '看完整支影片', '看完影片'] },
  { id: 't1_3', name: '私訊分享', tier: 1, synonyms: ['私訊轉傳', '私訊傳給朋友', '分享給朋友', 'dm分享'] },
  { id: 't1_4', name: '公開轉發', tier: 1, synonyms: ['轉發', '公開分享', '限時動態分享', '轉貼'] },
  { id: 't1_5', name: '收藏數', tier: 1, synonyms: ['收藏', '儲存', '先存起來', '收藏次數'] },
  { id: 't1_6', name: '點進主頁', tier: 1, synonyms: ['點大頭貼', '看主頁', '進個人頁', '點進個人檔案'] },
  { id: 't1_7', name: '熱烈討論', tier: 1, synonyms: ['留言很多', '討論熱絡', '大量留言', '留言互動'] },
  { id: 't1_8', name: '認真留言', tier: 1, synonyms: ['長留言', '深度留言', '留言分享心得', '高品質留言'] },
  { id: 't1_9', name: '連續觀看', tier: 1, synonyms: ['接著看下一篇', '連看', '持續看下去', '看完又看'] },
  { id: 't1_10', name: '剛發布的熱度', tier: 1, synonyms: ['前幾小時爆量', '首發熱度', '剛發就很多人看', '早期熱度'] },
  { id: 't1_11', name: '穩定觀看', tier: 1, synonyms: ['持續觀看', '沒有滑走', '不跳出', '觀看穩定'] },
  { id: 't1_12', name: '真的解決問題', tier: 1, synonyms: ['有解答', '解決需求', '回答問題', '符合搜尋意圖'] },
  { id: 't1_13', name: '原創首發', tier: 1, synonyms: ['原創', '自己做的內容', '首發內容', '不是搬運'] },
  { id: 't1_14', name: '內容可信', tier: 1, synonyms: ['可信度', '可靠', '不誇大', '真實可信'] },
  { id: 't1_15', name: '按讚數', tier: 1, synonyms: ['讚數', '按讚', '愛心數', 'like數'] },

  // Tier 2: 讓 AI 與搜尋引擎看懂你的關鍵
  { id: 't2_1', name: '前三秒抓眼球', tier: 2, synonyms: ['前3秒吸睛', '開頭吸睛', '一開始就抓人', '開場抓眼球'] },
  { id: 't2_2', name: '標題命中痛點', tier: 2, synonyms: ['標題打中需求', '標題打中痛點', '搜尋型標題', '標題很準'] },
  { id: 't2_3', name: '內容有條理', tier: 2, synonyms: ['結構清楚', '有大標小標', '條列重點', '內容有結構'] },
  { id: 't2_4', name: '影片有字幕', tier: 2, synonyms: ['字幕', '有上字幕', '看靜音也懂', '字幕清楚'] },
  { id: 't2_5', name: '畫面與聲音清晰', tier: 2, synonyms: ['畫質好', '收音清楚', '聲音清楚', '不模糊'] },
  { id: 't2_6', name: '第一手經驗', tier: 2, synonyms: ['親身經驗', '自己去過', '自己用過', '自己吃過'] },
  { id: 't2_7', name: '展現專業感', tier: 2, synonyms: ['專業', '內行細節', '專家感', '專業度'] },
  { id: 't2_8', name: '直接給答案', tier: 2, synonyms: ['先講重點', '先給答案', '開頭先破題', '先說結論'] },
  { id: 't2_9', name: '精準長尾字', tier: 2, synonyms: ['長尾關鍵字', '精準關鍵字', '細部搜尋字', '長尾字'] },
  { id: 't2_10', name: '語氣客觀中立', tier: 2, synonyms: ['客觀', '中立', '理性敘述', '客觀語氣'] },
  { id: 't2_11', name: '有附上來源', tier: 2, synonyms: ['附來源', '引用來源', '有連結', '有資料來源'] },
  { id: 't2_12', name: '有圖解輔助', tier: 2, synonyms: ['圖表說明', '圖解', '視覺化輔助', '圖片說明'] },
  { id: 't2_13', name: '標題與內容相符', tier: 2, synonyms: ['標題內容一致', '不誤導', '標題符合內容', '名實相符'] },
  { id: 't2_14', name: 'Hashtag 下得準', tier: 2, synonyms: ['hashtag精準', '標籤精準', '標籤分類清楚', '下標籤'] },
  { id: 't2_15', name: '話說得清楚', tier: 2, synonyms: ['表達清楚', '句型簡單', '說明明確', '好理解'] },

  // Tier 3: 把帳號養大的長期指標
  { id: 't3_1', name: '別的大帳號推薦你', tier: 3, synonyms: ['大帳號推薦', '網紅推薦', '權威標記', '被大帳號轉發'] },
  { id: 't3_2', name: '別的網站連到你', tier: 3, synonyms: ['外部連結', '被轉載', '反向連結', '媒體引用'] },
  { id: 't3_3', name: '主題夠專一', tier: 3, synonyms: ['垂直領域', '內容聚焦', '領域專一', '主題一致'] },
  { id: 't3_4', name: '名字常被搜尋', tier: 3, synonyms: ['品牌搜尋量', '帳號名被搜尋', '主動搜尋你', '搜尋你的名字'] },
  { id: 't3_5', name: '穩定定期發文', tier: 3, synonyms: ['固定更新', '穩定發文', '持續產出', '定期更新'] },
  { id: 't3_6', name: '跟上最新話題', tier: 3, synonyms: ['跟風熱門', '時事話題', '節慶話題', '熱門趨勢'] },
  { id: 't3_7', name: '留言區氣氛好', tier: 3, synonyms: ['理性討論', '社群氣氛好', '互動友善', '留言品質好'] },
  { id: 't3_8', name: '粉絲輪廓清楚', tier: 3, synonyms: ['受眾清楚', '目標族群清楚', 'TA明確', '粉絲定位清楚'] },
  { id: 't3_9', name: '內容豐富深入', tier: 3, synonyms: ['內容深度', '深入完整', '講得很透徹', '資訊完整'] },
  { id: 't3_10', name: '老粉絲常回來', tier: 3, synonyms: ['回訪率高', '老粉回流', '粉絲常回來看', '忠誠觀眾'] },

  // Tier 4: 系統加分的技術細節
  { id: 't4_1', name: '手機瀏覽體驗好', tier: 4, synonyms: ['手機好讀', '行動版體驗好', '手機看舒服', 'mobile friendly'] },
  { id: 't4_2', name: '搶先用平台新功能', tier: 4, synonyms: ['新功能紅利', '使用新功能', '新貼紙', '新音樂庫'] },
  { id: 't4_3', name: '提供站內延伸閱讀', tier: 4, synonyms: ['內部連結', '延伸閱讀', '其他文章連結', '站內導流'] },
  { id: 't4_4', name: '圖片有加說明文字', tier: 4, synonyms: ['圖片描述', '圖片 alt', '替代文字', '說明文字'] },
];

/**
 * 將使用者輸入模糊比對到預設關鍵字。
 * 會比對正式名稱與同義詞，只要任一方互相包含就視為命中。
 *
 * @param {string} input 使用者輸入的答案
 * @returns {object|null} 對應的關鍵字物件，若未命中則回傳 null
 */
export const findMatchedKeyword = (input) => {
  if (!input || input.trim() === '') return null;

  const formattedInput = input.trim().toLowerCase();

  for (const keyword of ALGORITHM_KEYWORDS) {
    const name = keyword.name.toLowerCase();
    const nameMatch = formattedInput.includes(name) || name.includes(formattedInput);
    if (nameMatch) {
      return keyword;
    }

    for (const synonym of keyword.synonyms) {
      const normalizedSynonym = synonym.toLowerCase();
      const synonymMatch =
        formattedInput.includes(normalizedSynonym) || normalizedSynonym.includes(formattedInput);

      if (synonymMatch) {
        return keyword;
      }
    }
  }

  return null;
};

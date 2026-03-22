// constants/quests.ts
export const QUESTS = [
  // --- 拍照挑戰 (參考 PDF 拍照挑戰站點) ---
  {
    id: 1,
    slug: "p9z3a",
    title: "三年級花圃的記憶",
    type: "photo",
    description: "前往三年級花圃(位置1)，找到最適合的角度。",
    question: "", // 拍照題不需要問題
    answer: "",
    referenceImage: "/tasks/tasks-1-1.png"
  },
  {
    id: 2,
    slug: "k8f2b",
    title: "花圃的另一個視角",
    type: "photo",
    description: "前往三年級花圃(位置2)，尋找不同的美。",
    referenceImage: "/tasks/tasks-2.png"
  },
  {
    id: 3,
    slug: "m7j6c",
    title: "揮灑汗水的聖地",
    type: "photo",
    description: "前往體育場/球場，模仿學長當年的熱血動作！",
    referenceImage: "/tasks/tasks-3.png"
  },
  {
    id: 4,
    slug: "q5h9d",
    title: "教室內的時光機 I",
    type: "photo",
    description: "在教室內找到一個角落，拍出懷舊感 (需上傳 IG 限動截圖)。",
    referenceImage: "/tasks/tasks-4.png"
  },
  {
    id: 5,
    slug: "w4g8e",
    title: "教室內的時光機 II",
    type: "photo",
    description: "在教室另一側，復刻這張老照片。",
    referenceImage: "/tasks/tasks-5.png"
  },
  {
    id: 6,
    slug: "x3k7f",
    title: "仁愛樓的俯瞰",
    type: "photo",
    description: "前往仁愛樓二樓，拍下指定的校園一角。",
    referenceImage: "/tasks/tasks-6.png"
  },
  {
    id: 7,
    slug: "y2n5g",
    title: "合作社的秘密",
    type: "photo",
    description: "前往合作社後方，這裡藏著什麼回憶？",
    referenceImage: "/tasks/tasks-7-1.png"
  },
  {
    id: 8,
    slug: "z1p4h",
    title: "導師室的木地板",
    type: "photo",
    description: "前往大導師辦公室外的木地板區。",
    referenceImage: "/tasks/tasks-8.png"
  },
  {
    id: 9,
    slug: "a9b3i",
    title: "守護健康的地方",
    type: "photo",
    description: "前往健康中心門口。",
    referenceImage: "/tasks/tasks-9.png"
  },
  {
    id: 10,
    slug: "c8d2j",
    title: "忠孝樓川堂",
    type: "photo",
    description: "在忠孝樓 1F 川堂，重現這張大合照的姿勢。",
    referenceImage: "/tasks/tasks-10.png"
  },

  // --- 歷史問答 (參考 PDF 歷史問答站點) ---
  // 注意：這裡我把題目選項整合在 question 裡，讓學生輸入 A, B, C, D
  {
    id: 11,
    slug: "e7f1k",
    title: "文學的搖籃",
    type: "quiz",
    description: "地點：校長室天橋",
    question: "花中被譽為「台灣文學的搖籃」之一，主要是因為這裡孕育了許多優秀的？ (A)商人 (B)運動員 (C)詩人與作家 (D)政治家",
    answer: "C" // 設定答案為選項代號
  },
  {
    id: 12,
    slug: "g6h9l",
    title: "體育館的傳說",
    type: "quiz",
    description: "地點：體育館",
    question: "花蓮高中體育館是在哪一年落成的？ (A)民國60年 (B)民國70年 (C)民國80年",
    answer: "B"
  },
  {
    id: 13,
    slug: "i5j8m",
    title: "詩人的守望",
    type: "quiz",
    description: "地點：圖資大樓",
    question: "花中校園環境中，哪一景象常出現在校友詩人作品中，象徵對外界的嚮往與守望？ (A)白燈塔 (B)雷峰塔 (C)億載金城 (D)紅毛城",
    answer: "A"
  },
  {
    id: 14,
    slug: "k4l7n",
    title: "校隊冷知識",
    type: "quiz",
    description: "地點：體育組",
    question: "下列何者「不是」花中目前的校隊項目？ (A)足球隊 (B)棒球隊 (C)羽球隊 (D)網球隊",
    answer: "C"
  },
  {
    id: 15,
    slug: "m3n6o",
    title: "穿堂的牌匾",
    type: "quiz",
    description: "地點：二樓穿堂",
    question: "請問二樓穿堂牌匾的題字人物是誰？ (A)蔣渭水 (B)蔣經國 (C)蔣中正 (D)孫中山",
    answer: "C"
  },
  {
    id: 16,
    slug: "p2q5p",
    title: "花中校訓",
    type: "quiz",
    description: "地點：三樓圖資大樓",
    question: "花蓮高中的校訓是哪一句話？ (A)禮義廉恥 (B)誠樸勤毅 (C)以天下為己任，惟詩書敦其仁 (D)自強不息",
    answer: "C"
  },
  {
    id: 17,
    slug: "r1s4q",
    title: "舊圖書館歷史",
    type: "quiz",
    description: "地點：舊圖書館",
    question: "舊圖書館是何時興建完工的？ (A)民國75年 (B)民國76年 (C)民國77年 (D)民國79年",
    answer: "B"
  },
  {
    id: 18,
    slug: "t9u3r",
    title: "警衛室的秘密",
    type: "quiz",
    description: "地點：警衛室",
    question: "目前的校門警衛室是哪一年改建的？(企劃書待補，暫定題) (A)2000年 (B)2010年 (C)2020年",
    answer: "A"
  },
  {
    id: 19,
    slug: "v8w2s",
    title: "和平樓整建",
    type: "quiz",
    description: "地點：家政教室",
    question: "和平樓整建工程是在何時完工的？ (A)民國101年 (B)民國99年 (C)民國100年 (D)民國98年",
    answer: "C"
  },
  {
    id: 20,
    slug: "x7y1t",
    title: "傑出校友廖鴻基",
    type: "quiz",
    description: "地點：信義樓3樓",
    question: "下列關於校友「廖鴻基」的敘述何者正確？ (A)花中第30屆校友 (B)從事鮪魚海洋調查 (C)50歲成立黑潮海洋文教基金會 (D)勵志關懷東部環境",
    answer: "A"
  }
];
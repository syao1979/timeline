const timeline = [
  {
    name: "宇宙之始",
    start: -13800000000,
    // end: -2400000,
    events: [
      {
        name: "第一代恒星",
        start: -13300000000,
        info: "万有引力将气体聚集并且加热，第一批恒星发出亮光.恒星通过核反应，产生能量与其万有引力抗衡，并产生了较重的化学元素.",
      },
      {
        name: "太阳",
        start: -5000000000,
        info: "第三代恒星",
      },
      {
        name: "地球",
        start: -4500000000,
        info: "太阳行星",
      },
      {
        name: "细胞",
        start: -3700000000,
        info: "地球生命",
      },
      {
        name: "原始细菌",
        start: -3300000000,
        info: "地球生命",
      },
      {
        name: "有细胞核",
        start: -2700000000,
        info: "地球生命",
      },
      {
        name: "多细胞植物",
        start: -2100000000,
        info: "地球生命",
      },
      {
        name: "叶绿体",
        start: -1250000000,
        info: "海洋中含有叶绿体的泛植物",
      },
      {
        name: "有性生殖",
        start: -1000000000,
        info: "海洋中含有叶绿体的泛植物",
      },
      {
        name: "蠕虫",
        start: -700000000,
        info: "外胚层,中胚层,内胚层间结构",
      },
      {
        name: "寒武纪",
        start: -540000000,
        info: "生命爆发式发展。无脊椎动物迅速发展，身体系统越来越完善，高等无脊椎动物出现",
      },
      {
        name: "脊椎动物",
        start: -450000000,
        info: "脊椎动物在海洋中出现，形成明显的头部，神经系统呈管状，其前端膨大成为脑，后方分化出脊髓",
      },
      {
        name: "陆地植物",
        start: -400000000,
        info: "植物开始向陆地扩张。昆虫成为首批陆生动物",
      },
      {
        name: "两栖类动物",
        start: -367000000,
        info: "陆生植物为两栖动物提供了充足的食物",
      },
      {
        name: "裸子植物",
        start: -300000000,
        info: "裸子植物首次出现了花粉管，花粉管将精子送到卵细胞旁，这样就使植物的生殖摆脱了水的限制",
      },
      {
        name: "爬行动物",
        start: -290000000,
        info: "爬行动物迅速发展",
      },
      {
        name: "爬行动物时代",
        start: -250000000,
        info: "气候改观,统治海洋近三亿年的生物就此衰亡",
      },
      {
        name: "哺乳动物",
        start: -220000000,
        info: "气候改观,统治海洋近三亿年的生物就此衰亡",
      },
      {
        name: "恐龙鼎盛",
        start: -200000000,
        info: "陆上恐龙,水中鱼龙，翼龙,鸟类相继出现了。地球大陆分解为两个大陆，植物和气候变得更加多样。但地球上总体仍然很温暖",
      },
      {
        name: "开花植物",
        start: -130000000,
        info: "花朵提高了植物成功受精的几率，有利于植物基因的传播，蜜蜂和蚂蚁在内的许多昆虫也出现了",
      },
      {
        name: "袋类",
        start: -70000000,
        info: "哺乳动物分化成有胎盘类哺乳动物和有袋类哺乳动物",
      },
      {
        name: "大型爬行动物绝减",
        start: -65000000,
        info: "一颗珠穆朗玛峰大小的陨石击中地球，造成地表气候的大改观，所有大型爬行动物通通都绝减了,哺乳动物和鸟类登上了历史舞台",
      },
      {
        name: "灵长类",
        start: -60000000,
        info: "鼠类和灵长类出现",
      },
      {
        name: "蹄类",
        start: -50000000,
        info: "",
      },
      {
        name: "蝙蝠",
        start: -45000000,
        info: "",
      },
      {
        name: "象类",
        start: -40000000,
        info: "",
      },
    ],
  },
  {
    name: "人类起源",
    start: -2400000,
    end: -3000,
    info: `A “human” is anyone who belongs to the genus Homo (Latin for “man”). 
          One of the earliest known humans is Homo habilis, or “handy man,” 
          who lived about 2.4 million to 1.4 million years ago in Eastern and Southern Africa`,
    events: [
      {
        name: "能人",
        standard: "Homo habilis",
        start: -2400000,
        location: "非洲",
        info: `史前的人类祖先`,
      },
      {
        name: "硕壮人",
        standard: "Homo rudolfensis",
        start: -1900000,
        location: "非洲",
        info: "卢多尔夫智人",
      },
      {
        name: "直立人",
        standard: "Homo erectus",
        start: -1890000,
        location:
          "Southern Africa all the way to modern-day China and Indonesia",
        info: "",
      },
      { name: "元谋", start: -1700000, location: "云南元谋" },
      {
        name: "海德堡人",
        standard: "Homo heidelbergensis",
        start: -600000,
        location: "非洲",
        info: `The closest relatives to modern human beings.`,
      },
      {
        name: "Neanderthals",
        standard: "Neanderthals",
        start: -400000,
        location: "非洲",
        info: `海德堡人 moved to Europe.`,
      },
      {
        name: "Denisovans",
        standard: "Denisovans",
        start: -390000,
        location: "非洲",
        info: "海德堡人 moved to Asia.",
      },
      {
        name: "早期智人",
        standard: "Homo sapiens",
        start: -250000,
        location: "非洲",
        info: "曾称古人, 生活在距今25万～4万年前",
      },
      {
        name: "晚期智人",
        standard: "Homo sapiens",
        start: -50000,
        location: "非洲",
        info: "亦称新人, 距今四五万年前开始出现. 现代人祖先.",
      },
      { name: "北京人", start: -70000, end: -20000, location: "北京周口店" },
      { name: "山顶洞人", start: -18000, format: "氏族公社" },
      { name: "河姆渡/半坡", start: -5000, end: -3000, format: "母系氏族公社" },
      // { name: "大汶口", start: -3000, end: -2000, format: "父系氏族公社" },
    ],
  },
  {
    name: "黄帝",
    start: -2697, // 黄帝元年
    end: -2070,
    format: "炎帝,黄帝,尧,舜,禹",
  },
  { name: "夏", start: -2070, end: -1559 },
  {
    name: "商",
    start: -1559,
    end: -1045,
    events: [{ name: "盘庚迁殷", start: -1300 }],
  },
  {
    name: "周",
    start: -1046,
    end: -256,
    events: [
      { name: "国人暴动/周召共和", start: -841 },
      { name: "犬戎攻周", start: -771 },
    ],
  },
  { name: "秦", start: -221, end: -206 },
  { name: "西楚", start: -206, end: -202 },
  { name: "西汉", start: -202, end: 8 },
  { name: "新", start: 8, end: 23 },
  // { name: "玄汉", start: 23, end: 25 },
  { name: "东汉", start: 25, end: 202 },
  { name: "三国", start: 220, end: 280 },
  { name: "晋", start: 265, end: 420 },
  { name: "南北朝", start: 420, end: 689 },
  { name: "隋", start: 581, end: 618 },
  { name: "唐", start: 618, end: 907 },
  {
    name: "五代十国",
    start: 907,
    end: 979,
    subline: [
      { name: "五代", start: 907, end: 960 },
      { name: "十国", start: 891, end: 979 },
    ],
  },
  { name: "宋", start: 960, end: 1279 },
  { name: "元", start: 1271, end: 1368 },
  { name: "明", start: 1368, end: 1644 },
  { name: "清", start: 1644, end: 1912 },
  {
    name: "中华民国",
    start: 1912,
    events: [
      { name: "新文化运动", start: 1915 },
      { name: "五四运动", start: 1919 },
      { name: "共产党成立", start: 1921 },
      { name: "国共合作", start: 1926 },
      { name: "日本侵华", start: 1937 },
      { name: "国共内战", start: 1945 },
    ],
  },
  { name: "中华人民共和国", start: 1949 },
];

export default timeline;

const data = [
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
    info: "炎帝,黄帝,尧,舜,禹",
  },
  { name: "夏", start: -2070, end: -1559 },
  {
    name: "商",
    start: -1559,
    end: -1045,
    events: [{ name: "盘庚迁殷", start: -1300 }],
  },
  {
    name: "西周",
    start: -1046,
    end: -771,
    events: [
      { name: "国人暴动", start: -841 },
      { name: "犬戎攻周", start: -771 },
    ],
  },
  {
    name: "东周",
    info: "周平王迁都洛邑",
    start: -770,
    end: -256,
    events: [
      { name: "春秋", start: -770, end: -476 },
      { name: "王子克之乱", start: -693 },
      { name: "齐桓公称霸", start: -681 },
      { name: "武公君晋", start: -678 },
      {
        name: "泓水之战",
        start: -638,
        info: "宋襄公讨伐郑国，与救郑楚兵战于泓水。宋襄公讲究“仁义”，要待楚兵渡河列阵后再战，结果大败受伤，次年伤重而死，后葬于襄陵",
      },
      { name: "王子带之乱", start: -636 },
      { name: "弭兵会盟/晋楚同霸", start: -546 },
      { name: "三家分晋", start: -403 },
      { name: "田和代齐", start: -386 },
      // { name: "战国", start: -475, end: -221 },
      { name: "商鞅变法", start: -356, end: -350 },
      { name: "秦灭周", start: -256 },
    ],
    famous: {
      china: [
        {
          name: "孔子",
        },
      ],
      world: [],
    },
  },
  {
    name: "秦",
    info: "秦统天下,确立郡县制,统一货币,度量衡和文字",
    start: -221,
    end: -206,
    events: [
      { name: "大泽乡起义", info: "陈胜 吴广起义爆发", start: -209 },
      { name: "巨鹿之战", info: "巨鹿之战", start: -207 },
      { name: "秦亡", info: "刘邦攻入咸阳", start: -206 },
    ],
  },
  { name: "西楚", start: -206, end: -202 },
  {
    name: "西汉",
    info: "",
    start: -202,
    end: 8,
    events: [
      {
        name: "张骞出西域",
        info: "公元前138年~119年 张骞两次出使西域",
        start: -138,
      },
    ],
  },
  {
    name: "新",
    info: "王莽夺取西汉政权　改国号新. 至23年",
    start: 8,
    end: 23,
    events: [
      { name: "绿林赤眉起义", info: "17~18年 绿林赤眉起义爆发", start: 17 },
    ],
  },
  // { name: "玄汉", start: 23, end: 25 },
  {
    name: "东汉",
    info: "",
    start: 25,
    end: 220,
    events: [
      { name: "班超出西域", info: "", start: 73 },
      { name: "造纸术", info: "蔡伦改进造纸术", start: 105 },
      { name: "地动仪", info: "张衡创造", start: 132 },
      { name: "黄巾起义", info: "张角领导黄巾起义", start: 184 },
      { name: "官渡之战", info: "", start: 200 },
      { name: "赤壁之战", info: "", start: 208 },
    ],
  },
  {
    name: "三国",
    info: "",
    start: 220,
    end: 280,
    events: [
      { name: "曹魏", info: "220年到280年 220年 魏国建立", start: 220 },
      { name: "蜀汉", info: "221年 蜀国建立", start: 221 },
      { name: "东吴", info: "222年 吴国建立", start: 222 },
    ],
  },
  { name: "西晋", start: 265, end: 316 },
  { name: "东晋", start: 316, end: 420 },
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
  {
    name: "清",
    start: 1644,
    end: 1912,
    events: [
      {
        name: "虎门销烟",
        start: 1839,
        info: "林则徐虎门销烟",
      },
      {
        name: "第一次鸦片战争",
        start: 1840,
        info: "1840-1842年，第一次鸦片战争，中国开始沦为半殖民地半封建社会",
      },
      {
        name: "南京条约",
        start: 1842,
        info: "1842年，第一个不平等条约-中英《南京条约》签订",
      },
      {
        name: "虎门条约",
        start: 1843,
        info: "1843年，中英《虎门条约》签订",
      },
      {
        name: "中美中法条约",
        start: 1844,
        info: "1844年，中美《望厦条约》和中法《黄埔条约》签订",
      },
      {
        name: "太平天国",
        start: 1851,
        info: "1851-1864年，太平天国运动",
      },
      {
        name: "第二次鸦片战争",
        start: 1856,
        info: "1856-1860年，第二次鸦片战争",
      },
      {
        name: "天津条约",
        start: 1858,
        info: "1858年，中俄、中美、中英、中法《天津条约》签订",
      },
      {
        name: "资政新篇",
        start: 1859,
        info: "1859年，提出在中国发展资本主义方案的第一人：洪仁玕《资政新篇》",
      },
      {
        name: "北京条约",
        start: 1860,
        info: "1860年，中英、中法、中俄《北京条约》签订",
      },
      {
        name: "中法战争",
        start: 1883,
        info: "1883-1885年，中法战争",
      },
      {
        name: "兴中会",
        start: 1894,
        info: "1894年，第一个资产阶级革命团体：兴中会",
      },
      {
        name: "甲午战争",
        start: 1895,
        info: "1894-1895年，甲午中日战争",
      },
      {
        name: "甲午战争",
        start: 1895,
        info: "1894-1895年，甲午中日战争. 1895年，列强侵华进入新阶段的标志：中日《马关条约》签订;第一个以武装起义形式从事民主革命的起义：广州起义;第一个资产阶级维新派的政治团体：强学会",
      },
      {
        name: "戊戌变法",
        start: 1898,
        info: "1898年，戊戌变法",
      },
      {
        name: "义和团",
        start: 1899,
        info: "1899—1900年，义和团运动",
      },
      {
        name: "八国联军侵华",
        start: 1900,
        info: "1900年，八国联军侵华战争， 两宫西狩",
      },
      {
        name: "辛丑条约",
        start: 1901,
        info: "1901年，中国半殖民地半封建社会秩序形成的标志：《辛丑条约》签订",
      },
      {
        name: "中国同盟会",
        start: 1905,
        info: "1905年，中国资产阶级民主革命进入新阶段的标志、第一个全国性的统一的资产阶级革命政党：中国同盟会成立;清政府下令一律停止科举考试",
      },
      {
        name: "萍浏醴起义",
        start: 1906,
        info: "1906年，同盟会成立后发动的第一次大规模的武装起义：萍浏醴起义",
      },
      {
        name: "辛亥革命",
        start: 1911,
        info: "1911年，辛亥革命",
      },
      {
        name: "清帝退位",
        start: 1912,
        info: "清帝退位",
      },
    ],
  },
  {
    name: "民国",
    start: 1912,
    events: [
      {
        name: "二次革命",
        start: 1913,
        info: "袁世凯镇压二次革命，同年当选为首任中华民国大总统",
      },
      { name: "中华民国约法", start: 1914 },
      { name: "新文化运动", start: 1915 },
      {
        name: "袁世凯称帝",
        start: 1916,
        info: "袁世凯恢复帝制失败. 1915年12月宣布自称皇帝，改国号为中华帝国，建元洪宪，史称“洪宪帝制”。此举遭到各方反对，引发护国运动，袁世凯不得不在做了83天皇帝之后宣布取消帝制.1916年6月6日因尿毒症不治而亡，归葬于河南安阳",
      },
      {
        name: "五四运动",
        start: 1919,
        info: "新文化运动兴起的标志：陈独秀在上海创办《新青年》;中国新民主主义革命开始的标志：五四运动",
      },
      {
        name: "上海共产主义小组",
        start: 1920,
        info: "中国第一个共产主义小组：上海共产主义小组",
      },
      { name: "共产党成立", start: 1921 },
      {
        name: "国共合作",
        start: 1924,
        info: "国共第一次合作、革命统一战线建立，国民大革命开始的标志：中国国民党一大召开",
      },
      { name: "北伐", start: 1926, end: 1928 },
      {
        name: "皖系段祺瑞下台",
        start: 1926.5,
        info: "皖系军阀段祺瑞、冯国璋、王士珍",
      },
      {
        name: "直系被灭",
        start: 1927,
        info: "直系军阀曹锟、吴佩孚、孙传芳, 被国民革命军消灭",
      },
      {
        name: "奉系垮台",
        start: 1928,
        info: "奉系张作霖,军阀政府垮台,历时十七年的北洋军阀从此覆灭",
      },
      {
        name: "九一八事变",
        start: 1931.9,
        info: "第一次中华苏维埃全国代表大会：在瑞金召开;中华苏维埃共和国临时中央政府成立",
      },
      { name: "伪满洲国成立", start: 1932 },
      { name: "红军长征", start: 1934, end: 1936 },
      {
        name: "遵义会议",
        start: 1935,
        info: "中国共产党从幼稚走向成熟的标志：遵义会议;一二·九运动",
      },
      { name: "西安事变", start: 1936 },
      { name: "抗日战争", start: 1931, end: 1945 },
      {
        name: "全面抗日",
        start: 1937,
        info: "日本发动全面侵华战争、抗日战争全面爆发的标志：七七事变;国民政府正面战场上的第一次大会战：淞沪会战;抗战开始第一次大捷：平型关大捷;南京大屠杀;重庆国民政府成立;第二次国共合作",
      },
      {
        name: "台儿庄战役",
        start: 1938,
        info: "国民正面战场抗战以来最大胜利：台儿庄战役;武汉会战",
      },
      { name: "第一次长沙会战", start: 1939 },
      { name: "百团大战", start: 1940, info: "南京汪伪国民政府成立;百团大战" },
      { name: "皖南事变", start: 1941, info: "围袭新四军事件; 第二次长沙会战" },
      { name: "第三次长沙会战", start: 1942 },
      { name: "豫湘桂战役", start: 1942 },
      {
        name: "日本投降",
        start: 1945,
        info: "中共七大;日本宣布投降;重庆谈判;“双十协定”签订",
      },
      { name: "国共内战", start: 1946, end: 1949 },
      {
        name: "三大战役",
        start: 1948,
        end: 1949,
        info: "辽沈战役、淮海战役、平津战役",
      },
      { name: "渡江战役", start: 1949, info: "国民党政权退往台湾" },
    ],
  },
  {
    name: "共和国",
    start: 1949,
    events: [
      {
        name: "韩战爆发",
        start: 1950,
        info: "志愿军入朝",
      },
      {
        name: "西藏解放",
        start: 1951,
        info: "",
      },
      {
        name: "完成土改",
        start: 1952,
        info: "",
      },
      {
        name: "韩战结束",
        start: 1953,
        info: "",
      },
      {
        name: "制定宪法",
        start: 1954,
        info: "",
      },
      {
        name: "农业合作化",
        start: 1955,
        info: "",
      },
      {
        name: "解放汽车",
        start: 1956,
        info: "",
      },
      {
        name: "武汉长江大桥",
        start: 1957,
        info: "",
      },
      {
        name: "三面红旗",
        start: 1958,
        info: "",
      },
      {
        name: "原子弹",
        start: 1964,
        info: "",
      },
      {
        name: "文革",
        start: 1966,
        info: "",
      },
      {
        name: "二月逆流",
        start: 1967,
        info: "",
      },
      {
        name: "人造卫星",
        start: 1970,
        info: "",
      },
      {
        name: "返联合国",
        start: 1971,
        info: "",
      },
      {
        name: "中日建交",
        start: 1972,
        info: "尼克松访华",
      },
      {
        name: "杂交水稻",
        start: 1973,
        info: "袁隆平",
      },
      {
        name: "核潜艇",
        start: 1974,
        info: "",
      },
      {
        name: "唐山地震",
        start: 1976,
        info: "唐山大地震",
      },
      {
        name: "792组成",
        start: 1979,
        info: "792",
      },
      {
        name: "香港回归",
        start: 1997,
        info: "7月1日,香港回归祖国",
      },
      {
        name: "澳门回归",
        start: 1999,
        info: "12月20日,澳门回归祖国",
      },
      {
        name: "北京奥运",
        start: 2008,
        info: "8月8日,北京举办第二十九届奥运会,中国取得了金牌51枚、奖牌总数100枚的历史最好成绩",
      },
    ],
  },
  {
    name: "今年",
    start: 2022, // will be replaced runtime
  },
];

export default data;

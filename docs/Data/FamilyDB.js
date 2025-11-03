window.FamilyDBConfig = {
  // 家族信息配置
  "family": {
  // 家族姓氏
  "surname": "张",
  
  // 家族发源地
  "origin": "中国",
  
  // 家族创立年份（如有记录）
  "foundingYear": "未知",
  
  // 其他家族信息
  "description": "张家族谱系统，记录家族成员信息和血缘关系"
  },
  // 家族管理团队
  "management": {
    // 管理团队当前状态：enable 表示正常运作中，disable 表示已停用
    "status": "enable",
    // 管理团队简介
    "description": "张氏家族管理团队负责统筹各分支事务、维护族谱数据及组织家族活动。",
    // 职位列表
    "positions": [
      {
        "id": "P001",
        "title": "总族长",
        "responsibilities": [
          "统筹全族重大事务",
          "审批各分支年度计划",
          "代表家族对外交流"
        ],
        "currentHolder": {
          "member_uuid": "ZHON234567",
          "name": "张德明",
          "contact": {
            "phone": "+86-138-0000-0001",
            "email": "zongzu.zhang@family.com",
            "wechat": "zhang_zongzu"
          }
        }
      },
      {
        "id": "P002",
        "title": "副族长（华南片区）",
        "responsibilities": [
          "协调广东、福建、台湾分支",
          "监督华南片区族产运营"
        ],
        "currentHolder": {
          "member_uuid": "GUAN456791",
          "name": "张礼杰",
          "contact": {
            "phone": "+86-138-1111-0002",
            "email": "fuzu.guangdong@family.com",
            "wechat": "zhang_lijie_fd"
          }
        }
      },
      {
        "id": "P003",
        "title": "副族长（华北片区）",
        "responsibilities": [
          "协调山东、山西分支",
          "组织华北片区祭祖大典"
        ],
        "currentHolder": {
          "member_uuid": "SHAN567890",
          "name": "张礼文",
          "contact": {
            "phone": "+86-138-2222-0003",
            "email": "fuzu.shandong@family.com",
            "wechat": "zhang_liwen_sd"
          }
        }
      },
      {
        "id": "P004",
        "title": "海外事务总长",
        "responsibilities": [
          "维护海外分支联络",
          "统筹国际家族联谊",
          "管理海外族产"
        ],
        "currentHolder": {
          "member_uuid": "MALA012345",
          "name": "张廉伟",
          "contact": {
            "phone": "+60-12-333-0004",
            "email": "overseas.zhang@family.com",
            "wechat": "zhang_lianwei_my"
          }
        }
      },
      {
        "id": "P005",
        "title": "族谱数据总监",
        "responsibilities": [
          "维护族谱系统数据完整",
          "审核新增成员信息",
          "定期备份与升级"
        ],
        "currentHolder": {
          "member_uuid": "SANX678907",
          "name": "张孝文",
          "contact": {
            "phone": "+86-138-4444-0005",
            "email": "data.zhang@family.com",
            "wechat": "zhang_xiaowen_db"
          }
        }
      },
      {
        "id": "P006",
        "title": "青年委员会主任",
        "responsibilities": [
          "组织青年家族成员交流",
          "策划青年创新创业基金",
          "传承家族文化给下一代"
        ],
        "currentHolder": {
          "member_uuid": "MALA012350",
          "name": "张美华",
          "contact": {
            "phone": "+60-12-555-0006",
            "email": "youth.zhang@family.com",
            "wechat": "zhang_meihua_yh"
          }
        }
      },
      {
        "id": "P007",
        "title": "财务总监",
        "responsibilities": [
          "编制年度家族预算",
          "审计各分支财务报表",
          "管理家族公益基金"
        ],
        "currentHolder": {
          "member_uuid": "SICH789018",
          "name": "张耻富贵",
          "contact": {
            "phone": "+86-138-6666-0007",
            "email": "finance.zhang@family.com",
            "wechat": "zhang_chifu_cw"
          }
        }
      },
      {
        "id": "P008",
        "title": "文化研究院院长",
        "responsibilities": [
          "编纂家族史料",
          "组织文化讲座与展览",
          "出版家族年刊"
        ],
        "currentHolder": {
          "member_uuid": "SHAN567896",
          "name": "张忠孝",
          "contact": {
            "phone": "+86-138-7777-0008",
            "email": "culture.zhang@family.com",
            "wechat": "zhang_zhongxiao_wh"
          }
        }
      }
    ],
    // 公共联系窗口
    "publicContact": {
      "officeAddress": "中国福建省厦门市思明区张氏家族大厦 8 楼",
      "officePhone": "+86-592-8888-8888",
      "officeEmail": "office@zhang-family.org",
      "officeHours": "周一至周五 09:00-17:30（北京时间）",
      "officialWebsite": "https://www.zhang-family.org",
      "wechatOfficial": "张氏宗亲会",
      "emergencyHotline": "+86-138-9999-9999（仅紧急事务）"
    },
    // 更新记录
    "updated_at": "2025-10-23T10:00:00.000Z"
  },
  "config": {
    "name": "default",
    "branches": [
      {
        "id": "ZHON",
        "name": "中华支",
        "description": "家族主要分支，居住在中国各地"
      },
      {
        "id": "XIAM",
        "name": "厦门支",
        "description": "福建厦门地区分支"
      },
      {
        "id": "GUAN",
        "name": "广东支",
        "description": "广东地区分支"
      },
      {
        "id": "SHAN",
        "name": "山东支",
        "description": "山东地区分支"
      },
      {
        "id": "SANX",
        "name": "山西支",
        "description": "山西地区分支"
      },
      {
        "id": "SICH",
        "name": "四川支",
        "description": "四川地区分支"
      },
      {
        "id": "TAIW",
        "name": "台湾支",
        "description": "台湾地区分支"
      },
      {
        "id": "SING",
        "name": "新加坡支",
        "description": "新加坡地区分支"
      },
      {
        "id": "MALA",
        "name": "马来西亚支",
        "description": "马来西亚地区分支"
      },
      {
        "id": "USAZ",
        "name": "美国支",
        "description": "美国地区分支"
      }
    ],
    "generationNames": [
      {
        "generation": 1,
        "names": [
          "德"
        ]
      },
      {
        "generation": 2,
        "names": [
          "仁"
        ]
      },
      {
        "generation": 3,
        "names": [
          "义"
        ]
      },
      {
        "generation": 4,
        "names": [
          "礼"
        ]
      },
      {
        "generation": 5,
        "names": [
          "智"
        ]
      },
      {
        "generation": 6,
        "names": [
          "信"
        ]
      },
      {
        "generation": 7,
        "names": [
          "忠"
        ]
      },
      {
        "generation": 8,
        "names": [
          "孝"
        ]
      },
      {
        "generation": 9,
        "names": [
          "廉"
        ]
      },
      {
        "generation": 10,
        "names": [
          "耻",
          "仲"
        ]
      },
      {
        "generation": 11,
        "names": [
          "温",
          "美"
        ]
      },
      {
        "generation": 12,
        "names": [
          "良",
          "忠"
        ]
      },
      {
        "generation": 13,
        "names": [
          "恭",
          "尊"
        ]
      },
      {
        "generation": 14,
        "names": [
          "俭",
          "兴"
        ]
      },
      {
        "generation": 15,
        "names": [
          "让",
          "逊"
        ]
      }
    ],
    "updated_at": "2025-10-24T08:48:32.132Z"
  },
  "members": [
    {
      "member_id": "456789",
      "member_uuid": "GUAN456789",
      "name": "张义财",
      "gender": "男",
      "birth_date": "1913-08-20",
      "death_date": "1966-10-25",
      "occupation": "商人",
      "bio": "广东商界知名人士",
      "zi": "义",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "GUAN456790",
      "child_id": [
        "GUAN456793",
        "GUAN456791"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-23T01:53:30.847Z",
      "Zibei": "义",
      "photo": "",
      "previous_names": ""
    },
    {
      "member_id": "456790",
      "member_uuid": "GUAN456790",
      "name": "黄丽娟",
      "gender": "女",
      "birth_date": "1915-09-25",
      "death_date": "1999-11-30",
      "occupation": "家庭主妇",
      "bio": "相夫教子",
      "zi": "",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 2,
      "father_id": "",
      "mother_id": "",
      "spouse_id": "GUAN456789",
      "child_id": [
        "GUAN456793",
        "GUAN456791"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-23T02:28:11.671Z",
      "Zibei": "",
      "photo": "",
      "previous_names": ""
    },
    {
      "member_id": "456791",
      "member_uuid": "GUAN456791",
      "name": "张礼杰",
      "gender": "男",
      "birth_date": "1938-10-30",
      "death_date": "2018-01-05",
      "occupation": "企业家",
      "bio": "创办多家企业",
      "zi": "礼",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 3,
      "father_id": "GUAN456789",
      "mother_id": "GUAN456790",
      "spouse_id": "GUAN456792",
      "child_id": [
        "GUAN456796",
        "GUAN456795"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:03:05.473Z"
    },
    {
      "member_id": "456792",
      "member_uuid": "GUAN456792",
      "name": "马小玲",
      "gender": "女",
      "birth_date": "1940-11-05",
      "occupation": "律师",
      "bio": "业界精英",
      "zi": "",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "GUAN456791",
      "child_id": [
        "GUAN456796",
        "GUAN456795"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:03:05.475Z"
    },
    {
      "member_id": "456793",
      "member_uuid": "GUAN456793",
      "name": "张智敏",
      "gender": "男",
      "birth_date": "1942-12-10",
      "occupation": "教授",
      "bio": "学术带头人",
      "zi": "智",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 3,
      "father_id": "GUAN456789",
      "mother_id": "GUAN456790",
      "spouse_id": "GUAN456794",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "456794",
      "member_uuid": "GUAN456794",
      "name": "陈嘉欣",
      "gender": "女",
      "birth_date": "1945-01-15",
      "occupation": "研究员",
      "bio": "科研工作者",
      "zi": "",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "GUAN456793",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "456795",
      "member_uuid": "GUAN456795",
      "name": "张信哲",
      "gender": "男",
      "birth_date": "1965-02-20",
      "occupation": "歌手",
      "bio": "知名音乐人",
      "zi": "信",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 4,
      "father_id": "GUAN456791",
      "mother_id": "GUAN456792",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "456796",
      "member_uuid": "GUAN456796",
      "name": "张忠良",
      "gender": "男",
      "birth_date": "1968-03-25",
      "occupation": "医生",
      "bio": "著名外科医生",
      "zi": "忠",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 4,
      "father_id": "GUAN456791",
      "mother_id": "GUAN456792",
      "spouse_id": "GUAN456797",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "456797",
      "member_uuid": "GUAN456797",
      "name": "刘佳",
      "gender": "女",
      "birth_date": "1970-04-30",
      "occupation": "演员",
      "bio": "影视明星",
      "zi": "",
      "branch_name": "广东支",
      "branch_char": "GUAN",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "GUAN456796",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "012345",
      "member_uuid": "MALA012345",
      "name": "张廉伟",
      "gender": "男",
      "birth_date": "1952-06-05",
      "occupation": "商人",
      "bio": "马来西亚富商",
      "zi": "廉",
      "branch_name": "马来西亚支",
      "branch_char": "MALA",
      "generation": 3,
      "father_id": "ZHON234571",
      "mother_id": "ZHON234572",
      "spouse_id": "MALA012346",
      "child_id": [
        "MALA012349",
        "MALA012347"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.612Z"
    },
    {
      "member_id": "012346",
      "member_uuid": "MALA012346",
      "name": "陈美琪",
      "gender": "女",
      "birth_date": "1955-07-10",
      "occupation": "商人",
      "bio": "企业家",
      "zi": "",
      "branch_name": "马来西亚支",
      "branch_char": "MALA",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "MALA012345",
      "child_id": [
        "MALA012349",
        "MALA012347"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.612Z"
    },
    {
      "member_id": "012347",
      "member_uuid": "MALA012347",
      "name": "张耻之",
      "gender": "男",
      "birth_date": "1978-08-15",
      "occupation": "工程师",
      "bio": "机械工程师",
      "zi": "耻",
      "branch_name": "马来西亚支",
      "branch_char": "MALA",
      "generation": 4,
      "father_id": "MALA012345",
      "mother_id": "MALA012346",
      "spouse_id": "MALA012348",
      "child_id": [
        "MALA012350"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.611Z"
    },
    {
      "member_id": "012348",
      "member_uuid": "MALA012348",
      "name": "林雅诗",
      "gender": "女",
      "birth_date": "1980-09-20",
      "occupation": "教师",
      "bio": "中文教师",
      "zi": "",
      "branch_name": "马来西亚支",
      "branch_char": "MALA",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "MALA012347",
      "child_id": [
        "MALA012350"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.613Z"
    },
    {
      "member_id": "012349",
      "member_uuid": "MALA012349",
      "name": "张仲明",
      "gender": "男",
      "birth_date": "1983-10-25",
      "occupation": "医生",
      "bio": "专科医生",
      "zi": "仲",
      "branch_name": "马来西亚支",
      "branch_char": "MALA",
      "generation": 4,
      "father_id": "MALA012345",
      "mother_id": "MALA012346",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:37.757Z"
    },
    {
      "member_id": "012350",
      "member_uuid": "MALA012350",
      "name": "张美华",
      "gender": "男",
      "birth_date": "2000-11-30",
      "occupation": "学生",
      "bio": "大学生",
      "zi": "美",
      "branch_name": "马来西亚支",
      "branch_char": "MALA",
      "generation": 5,
      "father_id": "MALA012347",
      "mother_id": "MALA012348",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:37.757Z"
    },
    {
      "member_id": "678901",
      "member_uuid": "SANX678901",
      "name": "张智远",
      "gender": "男",
      "birth_date": "1922-01-10",
      "death_date": "1998-03-15",
      "occupation": "矿工",
      "bio": "劳动模范",
      "zi": "智",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "SANX678902",
      "child_id": [
        "SANX678905",
        "SANX678903"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.619Z"
    },
    {
      "member_id": "678902",
      "member_uuid": "SANX678902",
      "name": "郭秀兰",
      "gender": "女",
      "birth_date": "1925-02-15",
      "death_date": "2002-04-20",
      "occupation": "农民",
      "bio": "勤劳朴实",
      "zi": "",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 2,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SANX678901",
      "child_id": [
        "SANX678905",
        "SANX678903"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.620Z"
    },
    {
      "member_id": "678903",
      "member_uuid": "SANX678903",
      "name": "张信义",
      "gender": "男",
      "birth_date": "1947-03-20",
      "death_date": "2017-05-25",
      "occupation": "工人",
      "bio": "技术骨干",
      "zi": "信",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 3,
      "father_id": "SANX678901",
      "mother_id": "SANX678902",
      "spouse_id": "SANX678904",
      "child_id": [
        "SANX678907"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.619Z"
    },
    {
      "member_id": "678904",
      "member_uuid": "SANX678904",
      "name": "杨巧英",
      "gender": "女",
      "birth_date": "1949-04-25",
      "occupation": "教师",
      "bio": "乡村教师",
      "zi": "",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SANX678903",
      "child_id": [
        "SANX678907"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.621Z"
    },
    {
      "member_id": "678905",
      "member_uuid": "SANX678905",
      "name": "张忠国",
      "gender": "男",
      "birth_date": "1952-05-30",
      "occupation": "工程师",
      "bio": "水利专家",
      "zi": "忠",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 3,
      "father_id": "SANX678901",
      "mother_id": "SANX678902",
      "spouse_id": "SANX678906",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "678906",
      "member_uuid": "SANX678906",
      "name": "郝红梅",
      "gender": "女",
      "birth_date": "1955-06-05",
      "occupation": "会计",
      "bio": "财务主管",
      "zi": "",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SANX678905",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "678907",
      "member_uuid": "SANX678907",
      "name": "张孝文",
      "gender": "男",
      "birth_date": "1975-07-10",
      "occupation": "程序员",
      "bio": "软件工程师",
      "zi": "孝",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 4,
      "father_id": "SANX678903",
      "mother_id": "SANX678904",
      "spouse_id": "SANX678908",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "678908",
      "member_uuid": "SANX678908",
      "name": "刘芳",
      "gender": "女",
      "birth_date": "1978-08-15",
      "occupation": "设计师",
      "bio": "UI设计师",
      "zi": "",
      "branch_name": "山西支",
      "branch_char": "SANX",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SANX678907",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "567890",
      "member_uuid": "SHAN567890",
      "name": "张礼文",
      "gender": "男",
      "birth_date": "1918-05-15",
      "death_date": "2000-07-20",
      "occupation": "教师",
      "bio": "国学大师",
      "zi": "礼",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "SHAN567891",
      "child_id": [
        "SHAN567894",
        "SHAN567892"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.628Z"
    },
    {
      "member_id": "567891",
      "member_uuid": "SHAN567891",
      "name": "赵雪梅",
      "gender": "女",
      "birth_date": "1920-06-20",
      "death_date": "2005-08-25",
      "occupation": "教师",
      "bio": "语文教师",
      "zi": "",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 2,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SHAN567890",
      "child_id": [
        "SHAN567894",
        "SHAN567892"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.628Z"
    },
    {
      "member_id": "567892",
      "member_uuid": "SHAN567892",
      "name": "张智广",
      "gender": "男",
      "birth_date": "1943-07-25",
      "death_date": "2015-09-30",
      "occupation": "作家",
      "bio": "知名文学家",
      "zi": "智",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 3,
      "father_id": "SHAN567890",
      "mother_id": "SHAN567891",
      "spouse_id": "SHAN567893",
      "child_id": [
        "SHAN567896"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.627Z"
    },
    {
      "member_id": "567893",
      "member_uuid": "SHAN567893",
      "name": "孙晓燕",
      "gender": "女",
      "birth_date": "1945-08-30",
      "occupation": "编辑",
      "bio": "文学编辑",
      "zi": "",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SHAN567892",
      "child_id": [
        "SHAN567896"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.629Z"
    },
    {
      "member_id": "567894",
      "member_uuid": "SHAN567894",
      "name": "张信诚",
      "gender": "男",
      "birth_date": "1948-09-05",
      "occupation": "公务员",
      "bio": "廉洁奉公",
      "zi": "信",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 3,
      "father_id": "SHAN567890",
      "mother_id": "SHAN567891",
      "spouse_id": "SHAN567895",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "567895",
      "member_uuid": "SHAN567895",
      "name": "李小华",
      "gender": "女",
      "birth_date": "1950-10-10",
      "occupation": "护士",
      "bio": "白衣天使",
      "zi": "",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SHAN567894",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "567896",
      "member_uuid": "SHAN567896",
      "name": "张忠孝",
      "gender": "男",
      "birth_date": "1970-11-15",
      "occupation": "军人",
      "bio": "保家卫国",
      "zi": "忠",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 4,
      "father_id": "SHAN567892",
      "mother_id": "SHAN567893",
      "spouse_id": "SHAN567897",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "567897",
      "member_uuid": "SHAN567897",
      "name": "王丽",
      "gender": "女",
      "birth_date": "1972-12-20",
      "occupation": "医生",
      "bio": "军医",
      "zi": "",
      "branch_name": "山东支",
      "branch_char": "SHAN",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SHAN567896",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "789012",
      "member_uuid": "SICH789012",
      "name": "张信德",
      "gender": "男",
      "birth_date": "1925-09-20",
      "death_date": "2005-11-25",
      "occupation": "厨师",
      "bio": "川菜大师",
      "zi": "信",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "SICH789013",
      "child_id": [
        "SICH789016",
        "SICH789014"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.636Z"
    },
    {
      "member_id": "789013",
      "member_uuid": "SICH789013",
      "name": "何素芳",
      "gender": "女",
      "birth_date": "1928-10-25",
      "death_date": "2010-12-30",
      "occupation": "服务员",
      "bio": "热情周到",
      "zi": "",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 2,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SICH789012",
      "child_id": [
        "SICH789016",
        "SICH789014"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.637Z"
    },
    {
      "member_id": "789014",
      "member_uuid": "SICH789014",
      "name": "张忠文",
      "gender": "男",
      "birth_date": "1950-11-30",
      "occupation": "厨师",
      "bio": "厨艺精湛",
      "zi": "忠",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 3,
      "father_id": "SICH789012",
      "mother_id": "SICH789013",
      "spouse_id": "SICH789015",
      "child_id": [
        "SICH789019",
        "SICH789018"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:03:05.484Z"
    },
    {
      "member_id": "789015",
      "member_uuid": "SICH789015",
      "name": "罗小红",
      "gender": "女",
      "birth_date": "1952-12-05",
      "occupation": "教师",
      "bio": "音乐教师",
      "zi": "",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SICH789014",
      "child_id": [
        "SICH789019",
        "SICH789018"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:03:05.486Z"
    },
    {
      "member_id": "789016",
      "member_uuid": "SICH789016",
      "name": "张孝义",
      "gender": "男",
      "birth_date": "1955-01-10",
      "occupation": "医生",
      "bio": "中医专家",
      "zi": "孝",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 3,
      "father_id": "SICH789012",
      "mother_id": "SICH789013",
      "spouse_id": "SICH789017",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "789017",
      "member_uuid": "SICH789017",
      "name": "邓丽君",
      "gender": "女",
      "birth_date": "1958-02-15",
      "occupation": "护士",
      "bio": "细心照料",
      "zi": "",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SICH789016",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "789018",
      "member_uuid": "SICH789018",
      "name": "张廉明",
      "gender": "男",
      "birth_date": "1980-03-20",
      "occupation": "程序员",
      "bio": "游戏开发",
      "zi": "廉",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 4,
      "father_id": "SICH789014",
      "mother_id": "SICH789015",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "789019",
      "member_uuid": "SICH789019",
      "name": "张耻之",
      "gender": "男",
      "birth_date": "1983-04-25",
      "occupation": "摄影师",
      "bio": "艺术创作",
      "zi": "耻",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 4,
      "father_id": "SICH789014",
      "mother_id": "SICH789015",
      "spouse_id": "SICH789020",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "789020",
      "member_uuid": "SICH789020",
      "name": "周雨桐",
      "gender": "女",
      "birth_date": "1985-05-30",
      "occupation": "模特",
      "bio": "时尚达人",
      "zi": "",
      "branch_name": "四川支",
      "branch_char": "SICH",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SICH789019",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "901234",
      "member_uuid": "SING901234",
      "name": "张孝全",
      "gender": "男",
      "birth_date": "1948-12-05",
      "occupation": "商人",
      "bio": "新加坡企业家",
      "zi": "孝",
      "branch_name": "新加坡支",
      "branch_char": "SING",
      "generation": 3,
      "father_id": "ZHON234571",
      "mother_id": "ZHON234572",
      "spouse_id": "SING901235",
      "child_id": [
        "SING901238",
        "SING901236"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.647Z"
    },
    {
      "member_id": "901235",
      "member_uuid": "SING901235",
      "name": "黄美华",
      "gender": "女",
      "birth_date": "1950-01-10",
      "occupation": "教师",
      "bio": "双语教师",
      "zi": "",
      "branch_name": "新加坡支",
      "branch_char": "SING",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SING901234",
      "child_id": [
        "SING901238",
        "SING901236"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.647Z"
    },
    {
      "member_id": "901236",
      "member_uuid": "SING901236",
      "name": "张廉明",
      "gender": "男",
      "birth_date": "1972-02-15",
      "occupation": "工程师",
      "bio": "IT专家",
      "zi": "廉",
      "branch_name": "新加坡支",
      "branch_char": "SING",
      "generation": 4,
      "father_id": "SING901234",
      "mother_id": "SING901235",
      "spouse_id": "SING901237",
      "child_id": [
        "SING901239"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.646Z"
    },
    {
      "member_id": "901237",
      "member_uuid": "SING901237",
      "name": "李美玲",
      "gender": "女",
      "birth_date": "1975-03-20",
      "occupation": "医生",
      "bio": "儿科医生",
      "zi": "",
      "branch_name": "新加坡支",
      "branch_char": "SING",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "SING901236",
      "child_id": [
        "SING901239"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.648Z"
    },
    {
      "member_id": "901238",
      "member_uuid": "SING901238",
      "name": "张耻贤",
      "gender": "男",
      "birth_date": "1978-04-25",
      "occupation": "律师",
      "bio": "国际律师",
      "zi": "耻",
      "branch_name": "新加坡支",
      "branch_char": "SING",
      "generation": 4,
      "father_id": "SING901234",
      "mother_id": "SING901235",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:37.757Z"
    },
    {
      "member_id": "901239",
      "member_uuid": "SING901239",
      "name": "张温中",
      "gender": "男",
      "birth_date": "1998-05-30",
      "occupation": "学生",
      "bio": "留学生",
      "zi": "温",
      "branch_name": "新加坡支",
      "branch_char": "SING",
      "generation": 5,
      "father_id": "SING901236",
      "mother_id": "SING901237",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:37.757Z"
    },
    {
      "member_id": "890123",
      "member_uuid": "TAIW890123",
      "name": "张忠民",
      "gender": "男",
      "birth_date": "1945-06-05",
      "occupation": "商人",
      "bio": "台商代表",
      "zi": "忠",
      "branch_name": "台湾支",
      "branch_char": "TAIW",
      "generation": 3,
      "father_id": "ZHON234569",
      "mother_id": "ZHON234570",
      "spouse_id": "TAIW890124",
      "child_id": [
        "TAIW890127",
        "TAIW890125"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.656Z"
    },
    {
      "member_id": "890124",
      "member_uuid": "TAIW890124",
      "name": "蔡依林",
      "gender": "女",
      "birth_date": "1948-07-10",
      "occupation": "歌手",
      "bio": "台湾歌手",
      "zi": "",
      "branch_name": "台湾支",
      "branch_char": "TAIW",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "TAIW890123",
      "child_id": [
        "TAIW890127",
        "TAIW890125"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.657Z"
    },
    {
      "member_id": "890125",
      "member_uuid": "TAIW890125",
      "name": "张孝华",
      "gender": "男",
      "birth_date": "1970-08-15",
      "occupation": "工程师",
      "bio": "电子工程师",
      "zi": "孝",
      "branch_name": "台湾支",
      "branch_char": "TAIW",
      "generation": 4,
      "father_id": "TAIW890123",
      "mother_id": "TAIW890124",
      "spouse_id": "TAIW890126",
      "child_id": [
        "TAIW890128"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.656Z"
    },
    {
      "member_id": "890126",
      "member_uuid": "TAIW890126",
      "name": "林心如",
      "gender": "女",
      "birth_date": "1973-09-20",
      "occupation": "演员",
      "bio": "影视明星",
      "zi": "",
      "branch_name": "台湾支",
      "branch_char": "TAIW",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "TAIW890125",
      "child_id": [
        "TAIW890128"
      ],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:50.657Z"
    },
    {
      "member_id": "890127",
      "member_uuid": "TAIW890127",
      "name": "张廉杰",
      "gender": "男",
      "birth_date": "1975-10-25",
      "occupation": "医生",
      "bio": "心脏科专家",
      "zi": "廉",
      "branch_name": "台湾支",
      "branch_char": "TAIW",
      "generation": 4,
      "father_id": "TAIW890123",
      "mother_id": "TAIW890124",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "890128",
      "member_uuid": "TAIW890128",
      "name": "张耻荣",
      "gender": "男",
      "birth_date": "1995-11-30",
      "occupation": "学生",
      "bio": "大学在读",
      "zi": "耻",
      "branch_name": "台湾支",
      "branch_char": "TAIW",
      "generation": 5,
      "father_id": "TAIW890125",
      "mother_id": "TAIW890126",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "123456",
      "member_uuid": "USAZ123456",
      "name": "张耻勇",
      "gender": "男",
      "birth_date": "1955-12-05",
      "occupation": "教授",
      "bio": "美国大学教授",
      "zi": "耻",
      "branch_name": "美国支",
      "branch_char": "USAZ",
      "generation": 3,
      "father_id": "ZHON234573",
      "mother_id": "ZHON234574",
      "spouse_id": "USAZ123457",
      "child_id": [
        "USAZ123460",
        "USAZ123458"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.665Z"
    },
    {
      "member_id": "123457",
      "member_uuid": "USAZ123457",
      "name": "玛丽史密斯",
      "gender": "女",
      "birth_date": "1958-01-10",
      "occupation": "教授",
      "bio": "美国学者",
      "zi": "",
      "branch_name": "美国支",
      "branch_char": "USAZ",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "USAZ123456",
      "child_id": [
        "USAZ123460",
        "USAZ123458"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.665Z"
    },
    {
      "member_id": "123458",
      "member_uuid": "USAZ123458",
      "name": "张仲华",
      "gender": "男",
      "birth_date": "1980-02-15",
      "occupation": "工程师",
      "bio": "硅谷工程师",
      "zi": "仲",
      "branch_name": "美国支",
      "branch_char": "USAZ",
      "generation": 4,
      "father_id": "USAZ123456",
      "mother_id": "USAZ123457",
      "spouse_id": "USAZ123459",
      "child_id": [
        "USAZ123461"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.665Z"
    },
    {
      "member_id": "123459",
      "member_uuid": "USAZ123459",
      "name": "艾米丽琼斯",
      "gender": "女",
      "birth_date": "1982-03-20",
      "occupation": "设计师",
      "bio": "创意总监",
      "zi": "",
      "branch_name": "美国支",
      "branch_char": "USAZ",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "USAZ123458",
      "child_id": [
        "USAZ123461"
      ],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:50.666Z"
    },
    {
      "member_id": "123460",
      "member_uuid": "USAZ123460",
      "name": "张温迪",
      "gender": "女",
      "birth_date": "1985-04-25",
      "occupation": "医生",
      "bio": "外科医生",
      "zi": "温",
      "branch_name": "美国支",
      "branch_char": "USAZ",
      "generation": 4,
      "father_id": "USAZ123456",
      "mother_id": "USAZ123457",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:37.757Z"
    },
    {
      "member_id": "123461",
      "member_uuid": "USAZ123461",
      "name": "张威廉",
      "gender": "男",
      "birth_date": "2005-05-30",
      "occupation": "学生",
      "bio": "高中生",
      "zi": "美",
      "branch_name": "美国支",
      "branch_char": "USAZ",
      "generation": 5,
      "father_id": "USAZ123458",
      "mother_id": "USAZ123459",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.757Z",
      "updated_at": "2025-10-22T10:02:37.757Z"
    },
    {
      "member_id": "345678",
      "member_uuid": "XIAM345678",
      "name": "张仁福",
      "gender": "男",
      "birth_date": "1910-01-15",
      "death_date": "1985-03-20",
      "occupation": "渔民",
      "bio": "海上作业者",
      "zi": "仁",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "XIAM345679",
      "child_id": [
        "XIAM345682",
        "XIAM345680"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:50.672Z"
    },
    {
      "member_id": "345679",
      "member_uuid": "XIAM345679",
      "name": "林玉梅",
      "gender": "女",
      "birth_date": "1912-02-20",
      "death_date": "1988-04-25",
      "occupation": "鱼贩",
      "bio": "勤劳致富",
      "zi": "",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 2,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "XIAM345678",
      "child_id": [
        "XIAM345682",
        "XIAM345680"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:50.673Z"
    },
    {
      "member_id": "345680",
      "member_uuid": "XIAM345680",
      "name": "张义明",
      "gender": "男",
      "birth_date": "1935-03-25",
      "death_date": "2005-05-30",
      "occupation": "船工",
      "bio": "航海经验丰富",
      "zi": "义",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 3,
      "father_id": "XIAM345678",
      "mother_id": "XIAM345679",
      "spouse_id": "XIAM345681",
      "child_id": [
        "XIAM345683"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:50.672Z"
    },
    {
      "member_id": "345681",
      "member_uuid": "XIAM345681",
      "name": "苏小红",
      "gender": "女",
      "birth_date": "1938-04-30",
      "occupation": "小吃摊主",
      "bio": "手艺精湛",
      "zi": "",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "XIAM345680",
      "child_id": [
        "XIAM345683"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:50.673Z"
    },
    {
      "member_id": "345682",
      "member_uuid": "XIAM345682",
      "name": "张礼祥",
      "gender": "男",
      "birth_date": "1942-05-05",
      "occupation": "导游",
      "bio": "熟悉厦门景点",
      "zi": "礼",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 3,
      "father_id": "XIAM345678",
      "mother_id": "XIAM345679",
      "spouse_id": null,
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "345683",
      "member_uuid": "XIAM345683",
      "name": "张智强",
      "gender": "男",
      "birth_date": "1960-06-10",
      "occupation": "程序员",
      "bio": "IT行业专家",
      "zi": "智",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 4,
      "father_id": "XIAM345680",
      "mother_id": "XIAM345681",
      "spouse_id": "XIAM345684",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "345684",
      "member_uuid": "XIAM345684",
      "name": "郑小华",
      "gender": "女",
      "birth_date": "1962-07-15",
      "occupation": "设计师",
      "bio": "创意无限",
      "zi": "",
      "branch_name": "厦门支",
      "branch_char": "XIAM",
      "generation": 4,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "XIAM345683",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.756Z",
      "updated_at": "2025-10-22T10:02:37.756Z"
    },
    {
      "member_id": "234567",
      "member_uuid": "ZHON234567",
      "name": "张德明",
      "gender": "男",
      "birth_date": "1890-01-01",
      "death_date": "1975-12-31",
      "occupation": "农民",
      "bio": "家族founder之一",
      "zi": "德",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 1,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "ZHON234568",
      "child_id": [
        "ZHON234571",
        "ZHON234569",
        "XIAM345678",
        "SICH789012",
        "SHAN567890",
        "SANX678901",
        "GUAN456789"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:03:09.785Z"
    },
    {
      "member_id": "234568",
      "member_uuid": "ZHON234568",
      "name": "李淑华",
      "gender": "女",
      "birth_date": "1892-02-02",
      "death_date": "1978-05-15",
      "occupation": "家庭主妇",
      "bio": "贤良淑德",
      "zi": "",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 1,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "ZHON234567",
      "child_id": [
        "ZHON234571",
        "ZHON234569",
        "XIAM345678",
        "SICH789012",
        "SHAN567890",
        "SANX678901",
        "GUAN456789"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:03:09.787Z"
    },
    {
      "member_id": "234569",
      "member_uuid": "ZHON234569",
      "name": "张仁山",
      "gender": "男",
      "birth_date": "1915-03-03",
      "death_date": "1995-09-20",
      "occupation": "教师",
      "bio": "教书育人四十载",
      "zi": "仁",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "ZHON234570",
      "child_id": [
        "ZHON234575",
        "ZHON234573",
        "TAIW890123"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:03:07.056Z"
    },
    {
      "member_id": "234570",
      "member_uuid": "ZHON234570",
      "name": "王秀珍",
      "gender": "女",
      "birth_date": "1918-04-04",
      "death_date": "2000-11-10",
      "occupation": "护士",
      "bio": "救死扶伤",
      "zi": "",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 2,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "ZHON234569",
      "child_id": [
        "ZHON234575",
        "ZHON234573",
        "TAIW890123"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:03:07.058Z"
    },
    {
      "member_id": "234571",
      "member_uuid": "ZHON234571",
      "name": "张义海",
      "gender": "男",
      "birth_date": "1920-05-05",
      "death_date": "1988-07-07",
      "occupation": "商人",
      "bio": "诚信经营",
      "zi": "义",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 2,
      "father_id": "ZHON234567",
      "mother_id": "ZHON234568",
      "spouse_id": "ZHON234572",
      "child_id": [
        "SING901234",
        "MALA012345"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:03:05.476Z"
    },
    {
      "member_id": "234572",
      "member_uuid": "ZHON234572",
      "name": "陈美芳",
      "gender": "女",
      "birth_date": "1922-06-06",
      "death_date": "1990-08-08",
      "occupation": "裁缝",
      "bio": "心灵手巧",
      "zi": "",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 2,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "ZHON234571",
      "child_id": [
        "SING901234",
        "MALA012345"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:03:05.477Z"
    },
    {
      "member_id": "234573",
      "member_uuid": "ZHON234573",
      "name": "张礼全",
      "gender": "男",
      "birth_date": "1940-07-07",
      "death_date": "2010-09-09",
      "occupation": "工程师",
      "bio": "技术专家",
      "zi": "礼",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 3,
      "father_id": "ZHON234569",
      "mother_id": "ZHON234570",
      "spouse_id": "ZHON234574",
      "child_id": [
        "USAZ123456"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:50.658Z"
    },
    {
      "member_id": "234574",
      "member_uuid": "ZHON234574",
      "name": "刘芳",
      "gender": "女",
      "birth_date": "1942-08-08",
      "death_date": "2015-10-10",
      "occupation": "会计",
      "bio": "精打细算",
      "zi": "",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "ZHON234573",
      "child_id": [
        "USAZ123456"
      ],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:50.660Z"
    },
    {
      "member_id": "234575",
      "member_uuid": "ZHON234575",
      "name": "张智远",
      "gender": "男",
      "birth_date": "1945-09-09",
      "occupation": "医生",
      "bio": "悬壶济世",
      "zi": "智",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 3,
      "father_id": "ZHON234569",
      "mother_id": "ZHON234570",
      "spouse_id": "ZHON234576",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:37.755Z"
    },
    {
      "member_id": "234576",
      "member_uuid": "ZHON234576",
      "name": "赵敏",
      "gender": "女",
      "birth_date": "1948-10-10",
      "occupation": "教师",
      "bio": "桃李满天下",
      "zi": "",
      "branch_name": "中华支",
      "branch_char": "ZHON",
      "generation": 3,
      "father_id": null,
      "mother_id": null,
      "spouse_id": "ZHON234575",
      "child_id": [],
      "created_at": "2025-10-22T10:02:37.755Z",
      "updated_at": "2025-10-22T10:02:37.755Z"
    }
  ]
} ;

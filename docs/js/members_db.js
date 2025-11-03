/*
  FamilyTree4 IndexedDB 管理模块
  - 负责初始化、清空、CRUD、批量导入/导出、配置持久化
  - 供 test/DBconfig.html 工具页与未来管理界面使用
  - 与站点渲染解耦（主站仅读取 Data/FamilyDB.js）
*/
(function(global){
  const DB_NAME = 'family_tree_db';
  const DB_VERSION = 4;
  const STORE = 'members';

  const CONFIG = {
    // 家族分支信息配置
    branches: [
      { id: 'ZHON', name: '中华支', description: '家族主要分支，居住在中国各地' },
      { id: 'XIAM', name: '厦门支', description: '福建厦门地区分支' },
      { id: 'GUAN', name: '广东支', description: '广东地区分支' },
      { id: 'SHAN', name: '山东支', description: '山东地区分支' },
      { id: 'SANX', name: '山西支', description: '山西地区分支' },
      { id: 'SICH', name: '四川支', description: '四川地区分支' },
      { id: 'TAIW', name: '台湾支', description: '台湾地区分支' },
      { id: 'SING', name: '新加坡支', description: '新加坡地区分支' },
      { id: 'MALA', name: '马来西亚支', description: '马来西亚地区分支' },
      { id: 'USAZ', name: '美国支', description: '美国地区分支' }
    ],

    // 字辈和世系对应表，支持多个字辈对应同一世系
    generationNames: [
      { generation: 1, names: ['德'] },
      { generation: 2, names: ['仁'] },
      { generation: 3, names: ['义'] },
      { generation: 4, names: ['礼'] },
      { generation: 5, names: ['智'] },
      { generation: 6, names: ['信'] },
      { generation: 7, names: ['忠'] },
      { generation: 8, names: ['孝'] },
      { generation: 9, names: ['廉'] },
      { generation: 10, names: ['耻','仲'] },
      { generation: 11, names: ['温','美'] },
      { generation: 12, names: ['良','忠'] },
      { generation: 13, names: ['恭','尊'] },
      { generation: 14, names: ['俭','兴'] },
      { generation: 15, names: ['让','逊'] }
    ],

    // 成员默认数据（用于导入）
    members: [
      { member_id: '234567', member_uuid: 'ZHON234567', name: '张德明', gender: '男', birth_date: '1890-01-01', death_date: '1975-12-31', occupation: '农民', bio: '家族founder之一', zi: '德', branch_name: '中华支', branch_char: 'ZHON', generation: 1, father_id: null, mother_id: null, spouse_id: 'ZHON234568' },
      { member_id: '234568', member_uuid: 'ZHON234568', name: '李淑华', gender: '女', birth_date: '1892-02-02', death_date: '1978-05-15', occupation: '家庭主妇', bio: '贤良淑德', zi: '', branch_name: '中华支', branch_char: 'ZHON', generation: 1, father_id: null, mother_id: null, spouse_id: 'ZHON234567' },
      { member_id: '234569', member_uuid: 'ZHON234569', name: '张仁山', gender: '男', birth_date: '1915-03-03', death_date: '1995-09-20', occupation: '教师', bio: '教书育人四十载', zi: '仁', branch_name: '中华支', branch_char: 'ZHON', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'ZHON234570' },
      { member_id: '234570', member_uuid: 'ZHON234570', name: '王秀珍', gender: '女', birth_date: '1918-04-04', death_date: '2000-11-10', occupation: '护士', bio: '救死扶伤', zi: '', branch_name: '中华支', branch_char: 'ZHON', generation: 2, father_id: null, mother_id: null, spouse_id: 'ZHON234569' },
      { member_id: '234571', member_uuid: 'ZHON234571', name: '张义海', gender: '男', birth_date: '1920-05-05', death_date: '1988-07-07', occupation: '商人', bio: '诚信经营', zi: '义', branch_name: '中华支', branch_char: 'ZHON', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'ZHON234572' },
      { member_id: '234572', member_uuid: 'ZHON234572', name: '陈美芳', gender: '女', birth_date: '1922-06-06', death_date: '1990-08-08', occupation: '裁缝', bio: '心灵手巧', zi: '', branch_name: '中华支', branch_char: 'ZHON', generation: 2, father_id: null, mother_id: null, spouse_id: 'ZHON234571' },
      { member_id: '234573', member_uuid: 'ZHON234573', name: '张礼全', gender: '男', birth_date: '1940-07-07', death_date: '2010-09-09', occupation: '工程师', bio: '技术专家', zi: '礼', branch_name: '中华支', branch_char: 'ZHON', generation: 3, father_id: 'ZHON234569', mother_id: 'ZHON234570', spouse_id: 'ZHON234574' },
      { member_id: '234574', member_uuid: 'ZHON234574', name: '刘芳', gender: '女', birth_date: '1942-08-08', death_date: '2015-10-10', occupation: '会计', bio: '精打细算', zi: '', branch_name: '中华支', branch_char: 'ZHON', generation: 3, father_id: null, mother_id: null, spouse_id: 'ZHON234573' },
      { member_id: '234575', member_uuid: 'ZHON234575', name: '张智远', gender: '男', birth_date: '1945-09-09', occupation: '医生', bio: '悬壶济世', zi: '智', branch_name: '中华支', branch_char: 'ZHON', generation: 3, father_id: 'ZHON234569', mother_id: 'ZHON234570', spouse_id: 'ZHON234576' },
      { member_id: '234576', member_uuid: 'ZHON234576', name: '赵敏', gender: '女', birth_date: '1948-10-10', occupation: '教师', bio: '桃李满天下', zi: '', branch_name: '中华支', branch_char: 'ZHON', generation: 3, father_id: null, mother_id: null, spouse_id: 'ZHON234575' },

      { member_id: '345678', member_uuid: 'XIAM345678', name: '张仁福', gender: '男', birth_date: '1910-01-15', death_date: '1985-03-20', occupation: '渔民', bio: '海上作业者', zi: '仁', branch_name: '厦门支', branch_char: 'XIAM', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'XIAM345679' },
      { member_id: '345679', member_uuid: 'XIAM345679', name: '林玉梅', gender: '女', birth_date: '1912-02-20', death_date: '1988-04-25', occupation: '鱼贩', bio: '勤劳致富', zi: '', branch_name: '厦门支', branch_char: 'XIAM', generation: 2, father_id: null, mother_id: null, spouse_id: 'XIAM345678' },
      { member_id: '345680', member_uuid: 'XIAM345680', name: '张义明', gender: '男', birth_date: '1935-03-25', death_date: '2005-05-30', occupation: '船工', bio: '航海经验丰富', zi: '义', branch_name: '厦门支', branch_char: 'XIAM', generation: 3, father_id: 'XIAM345678', mother_id: 'XIAM345679', spouse_id: 'XIAM345681' },
      { member_id: '345681', member_uuid: 'XIAM345681', name: '苏小红', gender: '女', birth_date: '1938-04-30', occupation: '小吃摊主', bio: '手艺精湛', zi: '', branch_name: '厦门支', branch_char: 'XIAM', generation: 3, father_id: null, mother_id: null, spouse_id: 'XIAM345680' },
      { member_id: '345682', member_uuid: 'XIAM345682', name: '张礼祥', gender: '男', birth_date: '1942-05-05', occupation: '导游', bio: '熟悉厦门景点', zi: '礼', branch_name: '厦门支', branch_char: 'XIAM', generation: 3, father_id: 'XIAM345678', mother_id: 'XIAM345679', spouse_id: null },
      { member_id: '345683', member_uuid: 'XIAM345683', name: '张智强', gender: '男', birth_date: '1960-06-10', occupation: '程序员', bio: 'IT行业专家', zi: '智', branch_name: '厦门支', branch_char: 'XIAM', generation: 4, father_id: 'XIAM345680', mother_id: 'XIAM345681', spouse_id: 'XIAM345684' },
      { member_id: '345684', member_uuid: 'XIAM345684', name: '郑小华', gender: '女', birth_date: '1962-07-15', occupation: '设计师', bio: '创意无限', zi: '', branch_name: '厦门支', branch_char: 'XIAM', generation: 4, father_id: null, mother_id: null, spouse_id: 'XIAM345683' },

      { member_id: '456789', member_uuid: 'GUAN456789', name: '张义财', gender: '男', birth_date: '1913-08-20', death_date: '1992-10-25', occupation: '商人', bio: '广东商界知名人士', zi: '义', branch_name: '广东支', branch_char: 'GUAN', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'GUAN456790' },
      { member_id: '456790', member_uuid: 'GUAN456790', name: '黄丽娟', gender: '女', birth_date: '1915-09-25', death_date: '1995-11-30', occupation: '家庭主妇', bio: '相夫教子', zi: '', branch_name: '广东支', branch_char: 'GUAN', generation: 2, father_id: null, mother_id: null, spouse_id: 'GUAN456789' },
      { member_id: '456791', member_uuid: 'GUAN456791', name: '张礼杰', gender: '男', birth_date: '1938-10-30', death_date: '2018-01-05', occupation: '企业家', bio: '创办多家企业', zi: '礼', branch_name: '广东支', branch_char: 'GUAN', generation: 3, father_id: 'GUAN456789', mother_id: 'GUAN456790', spouse_id: 'GUAN456792' },
      { member_id: '456792', member_uuid: 'GUAN456792', name: '马小玲', gender: '女', birth_date: '1940-11-05', occupation: '律师', bio: '业界精英', zi: '', branch_name: '广东支', branch_char: 'GUAN', generation: 3, father_id: null, mother_id: null, spouse_id: 'GUAN456791' },
      { member_id: '456793', member_uuid: 'GUAN456793', name: '张智敏', gender: '男', birth_date: '1942-12-10', occupation: '教授', bio: '学术带头人', zi: '智', branch_name: '广东支', branch_char: 'GUAN', generation: 3, father_id: 'GUAN456789', mother_id: 'GUAN456790', spouse_id: 'GUAN456794' },
      { member_id: '456794', member_uuid: 'GUAN456794', name: '陈嘉欣', gender: '女', birth_date: '1945-01-15', occupation: '研究员', bio: '科研工作者', zi: '', branch_name: '广东支', branch_char: 'GUAN', generation: 3, father_id: null, mother_id: null, spouse_id: 'GUAN456793' },
      { member_id: '456795', member_uuid: 'GUAN456795', name: '张信哲', gender: '男', birth_date: '1965-02-20', occupation: '歌手', bio: '知名音乐人', zi: '信', branch_name: '广东支', branch_char: 'GUAN', generation: 4, father_id: 'GUAN456791', mother_id: 'GUAN456792', spouse_id: null },
      { member_id: '456796', member_uuid: 'GUAN456796', name: '张忠良', gender: '男', birth_date: '1968-03-25', occupation: '医生', bio: '著名外科医生', zi: '忠', branch_name: '广东支', branch_char: 'GUAN', generation: 4, father_id: 'GUAN456791', mother_id: 'GUAN456792', spouse_id: 'GUAN456797' },
      { member_id: '456797', member_uuid: 'GUAN456797', name: '刘佳', gender: '女', birth_date: '1970-04-30', occupation: '演员', bio: '影视明星', zi: '', branch_name: '广东支', branch_char: 'GUAN', generation: 4, father_id: null, mother_id: null, spouse_id: 'GUAN456796' },

      { member_id: '567890', member_uuid: 'SHAN567890', name: '张礼文', gender: '男', birth_date: '1918-05-15', death_date: '2000-07-20', occupation: '教师', bio: '国学大师', zi: '礼', branch_name: '山东支', branch_char: 'SHAN', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'SHAN567891' },
      { member_id: '567891', member_uuid: 'SHAN567891', name: '赵雪梅', gender: '女', birth_date: '1920-06-20', death_date: '2005-08-25', occupation: '教师', bio: '语文教师', zi: '', branch_name: '山东支', branch_char: 'SHAN', generation: 2, father_id: null, mother_id: null, spouse_id: 'SHAN567890' },
      { member_id: '567892', member_uuid: 'SHAN567892', name: '张智广', gender: '男', birth_date: '1943-07-25', death_date: '2015-09-30', occupation: '作家', bio: '知名文学家', zi: '智', branch_name: '山东支', branch_char: 'SHAN', generation: 3, father_id: 'SHAN567890', mother_id: 'SHAN567891', spouse_id: 'SHAN567893' },
      { member_id: '567893', member_uuid: 'SHAN567893', name: '孙晓燕', gender: '女', birth_date: '1945-08-30', occupation: '编辑', bio: '文学编辑', zi: '', branch_name: '山东支', branch_char: 'SHAN', generation: 3, father_id: null, mother_id: null, spouse_id: 'SHAN567892' },
      { member_id: '567894', member_uuid: 'SHAN567894', name: '张信诚', gender: '男', birth_date: '1948-09-05', occupation: '公务员', bio: '廉洁奉公', zi: '信', branch_name: '山东支', branch_char: 'SHAN', generation: 3, father_id: 'SHAN567890', mother_id: 'SHAN567891', spouse_id: 'SHAN567895' },
      { member_id: '567895', member_uuid: 'SHAN567895', name: '李小华', gender: '女', birth_date: '1950-10-10', occupation: '护士', bio: '白衣天使', zi: '', branch_name: '山东支', branch_char: 'SHAN', generation: 3, father_id: null, mother_id: null, spouse_id: 'SHAN567894' },
      { member_id: '567896', member_uuid: 'SHAN567896', name: '张忠孝', gender: '男', birth_date: '1970-11-15', occupation: '军人', bio: '保家卫国', zi: '忠', branch_name: '山东支', branch_char: 'SHAN', generation: 4, father_id: 'SHAN567892', mother_id: 'SHAN567893', spouse_id: 'SHAN567897' },
      { member_id: '567897', member_uuid: 'SHAN567897', name: '王丽', gender: '女', birth_date: '1972-12-20', occupation: '医生', bio: '军医', zi: '', branch_name: '山东支', branch_char: 'SHAN', generation: 4, father_id: null, mother_id: null, spouse_id: 'SHAN567896' },

      { member_id: '678901', member_uuid: 'SANX678901', name: '张智远', gender: '男', birth_date: '1922-01-10', death_date: '1998-03-15', occupation: '矿工', bio: '劳动模范', zi: '智', branch_name: '山西支', branch_char: 'SANX', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'SANX678902' },
      { member_id: '678902', member_uuid: 'SANX678902', name: '郭秀兰', gender: '女', birth_date: '1925-02-15', death_date: '2002-04-20', occupation: '农民', bio: '勤劳朴实', zi: '', branch_name: '山西支', branch_char: 'SANX', generation: 2, father_id: null, mother_id: null, spouse_id: 'SANX678901' },
      { member_id: '678903', member_uuid: 'SANX678903', name: '张信义', gender: '男', birth_date: '1947-03-20', death_date: '2017-05-25', occupation: '工人', bio: '技术骨干', zi: '信', branch_name: '山西支', branch_char: 'SANX', generation: 3, father_id: 'SANX678901', mother_id: 'SANX678902', spouse_id: 'SANX678904' },
      { member_id: '678904', member_uuid: 'SANX678904', name: '杨巧英', gender: '女', birth_date: '1949-04-25', occupation: '教师', bio: '乡村教师', zi: '', branch_name: '山西支', branch_char: 'SANX', generation: 3, father_id: null, mother_id: null, spouse_id: 'SANX678903' },
      { member_id: '678905', member_uuid: 'SANX678905', name: '张忠国', gender: '男', birth_date: '1952-05-30', occupation: '工程师', bio: '水利专家', zi: '忠', branch_name: '山西支', branch_char: 'SANX', generation: 3, father_id: 'SANX678901', mother_id: 'SANX678902', spouse_id: 'SANX678906' },
      { member_id: '678906', member_uuid: 'SANX678906', name: '郝红梅', gender: '女', birth_date: '1955-06-05', occupation: '会计', bio: '财务主管', zi: '', branch_name: '山西支', branch_char: 'SANX', generation: 3, father_id: null, mother_id: null, spouse_id: 'SANX678905' },
      { member_id: '678907', member_uuid: 'SANX678907', name: '张孝文', gender: '男', birth_date: '1975-07-10', occupation: '程序员', bio: '软件工程师', zi: '孝', branch_name: '山西支', branch_char: 'SANX', generation: 4, father_id: 'SANX678903', mother_id: 'SANX678904', spouse_id: 'SANX678908' },
      { member_id: '678908', member_uuid: 'SANX678908', name: '刘芳', gender: '女', birth_date: '1978-08-15', occupation: '设计师', bio: 'UI设计师', zi: '', branch_name: '山西支', branch_char: 'SANX', generation: 4, father_id: null, mother_id: null, spouse_id: 'SANX678907' },

      { member_id: '789012', member_uuid: 'SICH789012', name: '张信德', gender: '男', birth_date: '1925-09-20', death_date: '2005-11-25', occupation: '厨师', bio: '川菜大师', zi: '信', branch_name: '四川支', branch_char: 'SICH', generation: 2, father_id: 'ZHON234567', mother_id: 'ZHON234568', spouse_id: 'SICH789013' },
      { member_id: '789013', member_uuid: 'SICH789013', name: '何素芳', gender: '女', birth_date: '1928-10-25', death_date: '2010-12-30', occupation: '服务员', bio: '热情周到', zi: '', branch_name: '四川支', branch_char: 'SICH', generation: 2, father_id: null, mother_id: null, spouse_id: 'SICH789012' },
      { member_id: '789014', member_uuid: 'SICH789014', name: '张忠文', gender: '男', birth_date: '1950-11-30', occupation: '厨师', bio: '厨艺精湛', zi: '忠', branch_name: '四川支', branch_char: 'SICH', generation: 3, father_id: 'SICH789012', mother_id: 'SICH789013', spouse_id: 'SICH789015' },
      { member_id: '789015', member_uuid: 'SICH789015', name: '罗小红', gender: '女', birth_date: '1952-12-05', occupation: '教师', bio: '音乐教师', zi: '', branch_name: '四川支', branch_char: 'SICH', generation: 3, father_id: null, mother_id: null, spouse_id: 'SICH789014' },
      { member_id: '789016', member_uuid: 'SICH789016', name: '张孝义', gender: '男', birth_date: '1955-01-10', occupation: '医生', bio: '中医专家', zi: '孝', branch_name: '四川支', branch_char: 'SICH', generation: 3, father_id: 'SICH789012', mother_id: 'SICH789013', spouse_id: 'SICH789017' },
      { member_id: '789017', member_uuid: 'SICH789017', name: '邓丽君', gender: '女', birth_date: '1958-02-15', occupation: '护士', bio: '细心照料', zi: '', branch_name: '四川支', branch_char: 'SICH', generation: 3, father_id: null, mother_id: null, spouse_id: 'SICH789016' },
      { member_id: '789018', member_uuid: 'SICH789018', name: '张廉明', gender: '男', birth_date: '1980-03-20', occupation: '程序员', bio: '游戏开发', zi: '廉', branch_name: '四川支', branch_char: 'SICH', generation: 4, father_id: 'SICH789014', mother_id: 'SICH789015', spouse_id: null },
      { member_id: '789019', member_uuid: 'SICH789019', name: '张耻之', gender: '男', birth_date: '1983-04-25', occupation: '摄影师', bio: '艺术创作', zi: '耻', branch_name: '四川支', branch_char: 'SICH', generation: 4, father_id: 'SICH789014', mother_id: 'SICH789015', spouse_id: 'SICH789020' },
      { member_id: '789020', member_uuid: 'SICH789020', name: '周雨桐', gender: '女', birth_date: '1985-05-30', occupation: '模特', bio: '时尚达人', zi: '', branch_name: '四川支', branch_char: 'SICH', generation: 4, father_id: null, mother_id: null, spouse_id: 'SICH789019' },

      { member_id: '890123', member_uuid: 'TAIW890123', name: '张忠民', gender: '男', birth_date: '1945-06-05', occupation: '商人', bio: '台商代表', zi: '忠', branch_name: '台湾支', branch_char: 'TAIW', generation: 3, father_id: 'ZHON234569', mother_id: 'ZHON234570', spouse_id: 'TAIW890124' },
      { member_id: '890124', member_uuid: 'TAIW890124', name: '蔡依林', gender: '女', birth_date: '1948-07-10', occupation: '歌手', bio: '台湾歌手', zi: '', branch_name: '台湾支', branch_char: 'TAIW', generation: 3, father_id: null, mother_id: null, spouse_id: 'TAIW890123' },
      { member_id: '890125', member_uuid: 'TAIW890125', name: '张孝华', gender: '男', birth_date: '1970-08-15', occupation: '工程师', bio: '电子工程师', zi: '孝', branch_name: '台湾支', branch_char: 'TAIW', generation: 4, father_id: 'TAIW890123', mother_id: 'TAIW890124', spouse_id: 'TAIW890126' },
      { member_id: '890126', member_uuid: 'TAIW890126', name: '林心如', gender: '女', birth_date: '1973-09-20', occupation: '演员', bio: '影视明星', zi: '', branch_name: '台湾支', branch_char: 'TAIW', generation: 4, father_id: null, mother_id: null, spouse_id: 'TAIW890125' },
      { member_id: '890127', member_uuid: 'TAIW890127', name: '张廉杰', gender: '男', birth_date: '1975-10-25', occupation: '医生', bio: '心脏科专家', zi: '廉', branch_name: '台湾支', branch_char: 'TAIW', generation: 4, father_id: 'TAIW890123', mother_id: 'TAIW890124', spouse_id: null },
      { member_id: '890128', member_uuid: 'TAIW890128', name: '张耻荣', gender: '男', birth_date: '1995-11-30', occupation: '学生', bio: '大学在读', zi: '耻', branch_name: '台湾支', branch_char: 'TAIW', generation: 5, father_id: 'TAIW890125', mother_id: 'TAIW890126', spouse_id: null },

      { member_id: '901234', member_uuid: 'SING901234', name: '张孝全', gender: '男', birth_date: '1948-12-05', occupation: '商人', bio: '新加坡企业家', zi: '孝', branch_name: '新加坡支', branch_char: 'SING', generation: 3, father_id: 'ZHON234571', mother_id: 'ZHON234572', spouse_id: 'SING901235' },
      { member_id: '901235', member_uuid: 'SING901235', name: '黄美华', gender: '女', birth_date: '1950-01-10', occupation: '教师', bio: '双语教师', zi: '', branch_name: '新加坡支', branch_char: 'SING', generation: 3, father_id: null, mother_id: null, spouse_id: 'SING901234' },
      { member_id: '901236', member_uuid: 'SING901236', name: '张廉明', gender: '男', birth_date: '1972-02-15', occupation: '工程师', bio: 'IT专家', zi: '廉', branch_name: '新加坡支', branch_char: 'SING', generation: 4, father_id: 'SING901234', mother_id: 'SING901235', spouse_id: 'SING901237' },
      { member_id: '901237', member_uuid: 'SING901237', name: '李美玲', gender: '女', birth_date: '1975-03-20', occupation: '医生', bio: '儿科医生', zi: '', branch_name: '新加坡支', branch_char: 'SING', generation: 4, father_id: null, mother_id: null, spouse_id: 'SING901236' },
      { member_id: '901238', member_uuid: 'SING901238', name: '张耻贤', gender: '男', birth_date: '1978-04-25', occupation: '律师', bio: '国际律师', zi: '耻', branch_name: '新加坡支', branch_char: 'SING', generation: 4, father_id: 'SING901234', mother_id: 'SING901235', spouse_id: null },
      { member_id: '901239', member_uuid: 'SING901239', name: '张温中', gender: '男', birth_date: '1998-05-30', occupation: '学生', bio: '留学生', zi: '温', branch_name: '新加坡支', branch_char: 'SING', generation: 5, father_id: 'SING901236', mother_id: 'SING901237', spouse_id: null },

      { member_id: '012345', member_uuid: 'MALA012345', name: '张廉伟', gender: '男', birth_date: '1952-06-05', occupation: '商人', bio: '马来西亚富商', zi: '廉', branch_name: '马来西亚支', branch_char: 'MALA', generation: 3, father_id: 'ZHON234571', mother_id: 'ZHON234572', spouse_id: 'MALA012346' },
      { member_id: '012346', member_uuid: 'MALA012346', name: '陈美琪', gender: '女', birth_date: '1955-07-10', occupation: '商人', bio: '企业家', zi: '', branch_name: '马来西亚支', branch_char: 'MALA', generation: 3, father_id: null, mother_id: null, spouse_id: 'MALA012345' },
      { member_id: '012347', member_uuid: 'MALA012347', name: '张耻之', gender: '男', birth_date: '1978-08-15', occupation: '工程师', bio: '机械工程师', zi: '耻', branch_name: '马来西亚支', branch_char: 'MALA', generation: 4, father_id: 'MALA012345', mother_id: 'MALA012346', spouse_id: 'MALA012348' },
      { member_id: '012348', member_uuid: 'MALA012348', name: '林雅诗', gender: '女', birth_date: '1980-09-20', occupation: '教师', bio: '中文教师', zi: '', branch_name: '马来西亚支', branch_char: 'MALA', generation: 4, father_id: null, mother_id: null, spouse_id: 'MALA012347' },
      { member_id: '012349', member_uuid: 'MALA012349', name: '张仲明', gender: '男', birth_date: '1983-10-25', occupation: '医生', bio: '专科医生', zi: '仲', branch_name: '马来西亚支', branch_char: 'MALA', generation: 4, father_id: 'MALA012345', mother_id: 'MALA012346', spouse_id: null },
      { member_id: '012350', member_uuid: 'MALA012350', name: '张美华', gender: '男', birth_date: '2000-11-30', occupation: '学生', bio: '大学生', zi: '美', branch_name: '马来西亚支', branch_char: 'MALA', generation: 5, father_id: 'MALA012347', mother_id: 'MALA012348', spouse_id: null },

      { member_id: '123456', member_uuid: 'USAZ123456', name: '张耻勇', gender: '男', birth_date: '1955-12-05', occupation: '教授', bio: '美国大学教授', zi: '耻', branch_name: '美国支', branch_char: 'USAZ', generation: 3, father_id: 'ZHON234573', mother_id: 'ZHON234574', spouse_id: 'USAZ123457' },
      { member_id: '123457', member_uuid: 'USAZ123457', name: '玛丽史密斯', gender: '女', birth_date: '1958-01-10', occupation: '教授', bio: '美国学者', zi: '', branch_name: '美国支', branch_char: 'USAZ', generation: 3, father_id: null, mother_id: null, spouse_id: 'USAZ123456' },
      { member_id: '123458', member_uuid: 'USAZ123458', name: '张仲华', gender: '男', birth_date: '1980-02-15', occupation: '工程师', bio: '硅谷工程师', zi: '仲', branch_name: '美国支', branch_char: 'USAZ', generation: 4, father_id: 'USAZ123456', mother_id: 'USAZ123457', spouse_id: 'USAZ123459' },
      { member_id: '123459', member_uuid: 'USAZ123459', name: '艾米丽琼斯', gender: '女', birth_date: '1982-03-20', occupation: '设计师', bio: '创意总监', zi: '', branch_name: '美国支', branch_char: 'USAZ', generation: 4, father_id: null, mother_id: null, spouse_id: 'USAZ123458' },
      { member_id: '123460', member_uuid: 'USAZ123460', name: '张温迪', gender: '女', birth_date: '1985-04-25', occupation: '医生', bio: '外科医生', zi: '温', branch_name: '美国支', branch_char: 'USAZ', generation: 4, father_id: 'USAZ123456', mother_id: 'USAZ123457', spouse_id: null },
      { member_id: '123461', member_uuid: 'USAZ123461', name: '张威廉', gender: '男', birth_date: '2005-05-30', occupation: '学生', bio: '高中生', zi: '美', branch_name: '美国支', branch_char: 'USAZ', generation: 5, father_id: 'USAZ123458', mother_id: 'USAZ123459', spouse_id: null }
    ],

    // 以下映射由上面两个列表派生构建
    zibeiToGenerationMap: {},
    branchCharToNameMap: {}
  };

  function openDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // 创建/升级 members 表
        if(!db.objectStoreNames.contains(STORE)){
          const store = db.createObjectStore(STORE, { keyPath: 'member_uuid' });
          store.createIndex('member_id', 'member_id', { unique: true });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('gender', 'gender', { unique: false });
          store.createIndex('birth_date', 'birth_date', { unique: false });
          store.createIndex('death_date', 'death_date', { unique: false });
          store.createIndex('generation', 'generation', { unique: false });
          store.createIndex('branch_char', 'branch_char', { unique: false });
          store.createIndex('branch_name', 'branch_name', { unique: false });
          store.createIndex('father_id', 'father_id', { unique: false });
          store.createIndex('mother_id', 'mother_id', { unique: false });
          store.createIndex('spouse_id', 'spouse_id', { unique: false });
          store.createIndex('child_id', 'child_id', { unique: false, multiEntry: true });
          store.createIndex('photo', 'photo', { unique: false });
          store.createIndex('previous_names', 'previous_names', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
          store.createIndex('updated_at', 'updated_at', { unique: false });
        } else {
          const store = e.target.transaction.objectStore(STORE);
          if(!store.indexNames.contains('photo')){
            store.createIndex('photo', 'photo', { unique: false });
          }
          if(!store.indexNames.contains('previous_names')){
            store.createIndex('previous_names', 'previous_names', { unique: false });
          }
        }
        // 创建/升级配置表
        let cfgStore;
        if(!db.objectStoreNames.contains('config')){
          cfgStore = db.createObjectStore('config', { keyPath: 'name' });
          cfgStore.createIndex('updated_at','updated_at',{unique:false});
        } else {
          cfgStore = e.target.transaction.objectStore('config');
        }
        
        // 创建/升级 家族/管理信息持久化表
        let fmStore;
        if(!db.objectStoreNames.contains('family_mgmt')){
          fmStore = db.createObjectStore('family_mgmt', { keyPath: 'name' });
          fmStore.createIndex('updated_at','updated_at',{unique:false});
        } else {
          fmStore = e.target.transaction.objectStore('family_mgmt');
        }

        // 写入默认配置
        try {
          rebuildDerivedMaps();
          cfgStore.put({ name: 'default', branches: CONFIG.branches, generationNames: CONFIG.generationNames, updated_at: nowISO() });
          // 若 family_mgmt 不存在默认记录，则写入一个空的默认记录（不覆盖已有）
          fmStore.put({ name: 'default', family: {}, management: {}, updated_at: nowISO() });
        } catch(_){ }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function withStore(db, mode, fn){
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const res = fn(store);
      tx.oncomplete = () => resolve(res);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  function nowISO(){ return new Date().toISOString(); }

  function isSixDigit(str){ return /^[0-9]{6}$/.test(String(str||'')); }
  function isFourLetters(str){ return /^[A-Za-z]{4}$/.test(String(str||'')); }
  function isUUIDLike(str){ return /^[A-Za-z]{4}[0-9]{6}$/.test(String(str||'')); }

  function validateMember(input){
    const errors = [];
    if(!input.name) errors.push('name 为必填');
    if(input.gender && !['男','女'].includes(input.gender)) errors.push('gender 只能是 男 或 女');
    if(input.bio && String(input.bio).length > 200) errors.push('bio 最长约200字');
    if(input.branch_char && !isFourLetters(input.branch_char)) errors.push('branch_char 必须为四位字母');
    if(input.member_id && !isSixDigit(input.member_id)) errors.push('member_id 必须为6位数字');
    if(input.member_uuid && !isUUIDLike(input.member_uuid)) errors.push('member_uuid 必须为4字母+6数字');
    ['father_id','mother_id','spouse_id'].forEach(f => {
      if(input[f] && !isUUIDLike(input[f])) errors.push(f+' 必须为成员 member_uuid 格式');
    });
    if(input.child_id){
      const arr = Array.isArray(input.child_id) ? input.child_id : [input.child_id];
      if(arr.some(v => !isUUIDLike(v))) errors.push('child_id 中存在非法 member_uuid');
    }
    if(errors.length) throw new Error(errors.join('；'));
  }

  async function ensureUniqueMemberId(db){
    const tryOnce = () => String(Math.floor(100000 + Math.random()*900000));
    for(let i=0;i<20;i++){
      const mid = tryOnce();
      const exists = await withStore(db, 'readonly', (store) => store.index('member_id').get(mid)).then(req => new Promise((res) => {
        req.onsuccess = () => res(!!req.result);
        req.onerror = () => res(true);
      }));
      if(!exists) return mid;
    }
    throw new Error('无法生成唯一的 member_id');
  }

  function buildUUID(branchChar, memberId){
    return String(branchChar||'').toUpperCase() + String(memberId||'');
  }

  async function getConfig(){
    const db = await openDB();
    const rec = await new Promise((resolve) => {
      const tx = db.transaction('config','readonly');
      const store = tx.objectStore('config');
      const req = store.get('default');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    db.close();
    return rec;
  }

  // 家族/管理信息持久化：读取/写入/导入/导出
  async function getFamilyMgmt(){
    const db = await openDB();
    const rec = await new Promise((resolve) => {
      const tx = db.transaction('family_mgmt','readonly');
      const store = tx.objectStore('family_mgmt');
      const req = store.get('default');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    db.close();
    return rec;
  }

  async function setFamilyMgmt(obj){
    const db = await openDB();
    await new Promise((resolve) => {
      const tx = db.transaction('family_mgmt','readwrite');
      const store = tx.objectStore('family_mgmt');
      store.put({ name: 'default', family: obj && obj.family ? obj.family : {}, management: obj && obj.management ? obj.management : {}, updated_at: nowISO() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
    return true;
  }

  async function exportFamilyMgmt(){
    const rec = await getFamilyMgmt();
    return JSON.stringify(rec || { name: 'default', family: {}, management: {} }, null, 2);
  }

  async function importFamilyMgmt(obj){
    await setFamilyMgmt(obj || { family: {}, management: {} });
    return getFamilyMgmt();
  }

  async function writeDefaultConfigIfMissing(){
    const existing = await getConfig();
    if(existing && Array.isArray(existing.branches) && Array.isArray(existing.generationNames)){
      CONFIG.branches = existing.branches || CONFIG.branches;
      CONFIG.generationNames = existing.generationNames || CONFIG.generationNames;
      rebuildDerivedMaps();
      return false;
    }
    const db = await openDB();
    await new Promise((resolve) => {
      const tx = db.transaction('config','readwrite');
      const store = tx.objectStore('config');
      store.put({ name: 'default', branches: CONFIG.branches, generationNames: CONFIG.generationNames, updated_at: nowISO() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
    rebuildDerivedMaps();
    return true;
  }

  async function initDB(){
    const db = await openDB();
    await writeDefaultConfigIfMissing();
    return db;
  }

  async function clearStore(){
    const db = await openDB();
    await withStore(db, 'readwrite', (store) => store.clear());
    db.close();
    return true;
  }

  async function resetDB(){
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return initDB();
  }

  async function addMember(input){
    const db = await openDB();
    validateMember(input);
    const branch_char = String(input.branch_char||'').toUpperCase();
    if(!isFourLetters(branch_char)) throw new Error('新增成员需提供有效 branch_char');
    const member_id = input.member_id || await ensureUniqueMemberId(db);
    const member_uuid = input.member_uuid || buildUUID(branch_char, member_id);
    const now = nowISO();
    const record = {
      member_id: member_id,
      member_uuid: member_uuid,
      name: input.name,
      gender: input.gender||'',
      birth_date: input.birth_date||'',
      death_date: input.death_date||'',
      occupation: input.occupation||'',
      bio: input.bio||'',
      photo: input.photo||'',
      Zibei: input.Zibei||'',
      branch_name: input.branch_name || CONFIG.branchCharToNameMap[branch_char] || '',
      branch_char: branch_char,
      generation: input.generation || (CONFIG.zibeiToGenerationMap[input.Zibei||'']||null),
      previous_names: input.previous_names||'',
      father_id: input.father_id||'',
      mother_id: input.mother_id||'',
      spouse_id: input.spouse_id||'',
      child_id: Array.isArray(input.child_id)? input.child_id : (input.child_id? [input.child_id] : []),
      created_at: now,
      updated_at: now
    };
    // 父母存在性校验（要求抛出错误）
    if(record.father_id){ const f = await getMemberByUUID(record.father_id); if(!f) { db.close(); throw new Error(`父ID不存在：${record.father_id}`); } }
    if(record.mother_id){ const m = await getMemberByUUID(record.mother_id); if(!m) { db.close(); throw new Error(`母ID不存在：${record.mother_id}`); } }
    validateMember(record);
    await withStore(db,'readwrite',(store)=>store.add(record));
    // 新增后执行关系双向同步（父母child_id、配偶spouse_id双向、子女父/母设置）
    await ensureRelationsOnSave(record, null);
    db.close();
    return record;
  }

  async function updateMember(member_uuid, updates){
    const db = await openDB();
    const existing = await new Promise((resolve) => {
      const tx = db.transaction(STORE,'readonly');
      const store = tx.objectStore(STORE);
      const req = store.get(member_uuid);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if(!existing) { db.close(); throw new Error('成员不存在'); }
    const merged = { ...existing, ...updates, updated_at: nowISO() };

    if(merged.father_id){
      const f = await getMemberByUUID(merged.father_id);
      if(!f) { db.close(); throw new Error(`父ID不存在：${merged.father_id}`); }
    }
    if(merged.mother_id){
      const m = await getMemberByUUID(merged.mother_id);
      if(!m) { db.close(); throw new Error(`母ID不存在：${merged.mother_id}`); }
    }

    validateMember(merged);

    await new Promise((resolve) => {
      const tx = db.transaction(STORE,'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.put(merged);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });

    await ensureRelationsOnSave(merged, existing);

    db.close();
    return merged;
  }

  async function deleteMember(member_uuid){
    const db = await openDB();
    await withStore(db,'readwrite',(store)=>store.delete(member_uuid));
    db.close();
    return true;
  }

  async function getMemberByUUID(member_uuid){
    const db = await openDB();
    const rec = await new Promise((resolve) => {
      const tx = db.transaction(STORE,'readonly');
      const store = tx.objectStore(STORE);
      const req = store.get(member_uuid);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    db.close();
    return rec;
  }

  async function getMemberById(member_id){
    const db = await openDB();
    const rec = await new Promise((resolve) => {
      const tx = db.transaction(STORE,'readonly');
      const store = tx.objectStore(STORE);
      const req = store.index('member_id').get(member_id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    db.close();
    return rec;
  }

  async function queryMembers(filters){
    const db = await openDB();
    const out = [];
    await withStore(db,'readonly',(store)=>{
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor){
          const v = cursor.value;
          let match = true;
          for(const k in (filters||{})){
            const val = filters[k];
            if(k==='child_id' && Array.isArray(val)){
              match = val.every(x => v.child_id.includes(x));
            }else if(val!=null && v[k] !== val) { match = false; }
            if(!match) break;
          }
          if(match) out.push(v);
          cursor.continue();
        }
      };
      return req;
    });
    db.close();
    return out;
  }

  async function exportMembers(){
    const all = await queryMembers();
    return JSON.stringify(all, null, 2);
  }

  async function importMembers(list, options){
    const overwrite = !!(options && options.overwrite);
    const db = await openDB();
    let ok=0, fail=0, errors=[];
    await withStore(db,'readwrite',(store)=>{
      (list||[]).forEach((raw)=>{
        try{
          validateMember(raw);
          const bchar = String(raw.branch_char||'').toUpperCase();
          const mid = raw.member_id;
          const uuid = raw.member_uuid || (isFourLetters(bchar)&&isSixDigit(mid) ? buildUUID(bchar, mid) : null);
          if(!uuid) throw new Error('导入项缺少有效 member_uuid 或 branch_char+member_id');
          const record = {
            ...raw,
            branch_char: bchar,
            child_id: Array.isArray(raw.child_id)? raw.child_id : (raw.child_id? [raw.child_id] : []),
            created_at: raw.created_at||nowISO(),
            updated_at: nowISO()
          };
          const req = overwrite ? store.put(record) : store.add(record);
          req.onsuccess = ()=>{ ok++; };
          req.onerror = (e)=>{ fail++; errors.push(String(e.target.error)); };
        }catch(err){ fail++; errors.push(String(err.message||err)); }
      });
      return true;
    });
    db.close();
    return { ok, fail, errors };
  }

  // 由 CONFIG.branches 和 CONFIG.generationNames 派生出映射
  function rebuildDerivedMaps(){
    const zmap = {};
    (CONFIG.generationNames||[]).forEach(({generation, names})=>{
      (names||[]).forEach(n=>{ zmap[String(n)] = generation; });
    });
    CONFIG.zibeiToGenerationMap = zmap;

    const bmap = {};
    (CONFIG.branches||[]).forEach(({id, name})=>{ if(id) bmap[String(id).toUpperCase()] = name||''; });
    CONFIG.branchCharToNameMap = bmap;
  }
  rebuildDerivedMaps();

  async function setConfig({ branches, generationNames, zibeiToGenerationMap, branchCharToNameMap }){
    if(Array.isArray(branches)) CONFIG.branches = branches;
    if(Array.isArray(generationNames)) CONFIG.generationNames = generationNames;
    // 优先使用传入映射，否则由列表派生
    if(zibeiToGenerationMap) CONFIG.zibeiToGenerationMap = zibeiToGenerationMap; else rebuildDerivedMaps();
    if(branchCharToNameMap) CONFIG.branchCharToNameMap = branchCharToNameMap; else rebuildDerivedMaps();
    // 将最新配置写入数据库配置表（等待事务完成）
    const db = await openDB();
    await new Promise((resolve) => {
      const tx = db.transaction('config','readwrite');
      const store = tx.objectStore('config');
      store.put({ name: 'default', branches: CONFIG.branches, generationNames: CONFIG.generationNames, updated_at: nowISO() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  }

  async function exportConfig(){
    const cfg = await getConfig();
    return JSON.stringify(cfg || { name: 'default', branches: CONFIG.branches, generationNames: CONFIG.generationNames }, null, 2);
  }

  async function importConfig(configObj){
    const branches = Array.isArray(configObj && configObj.branches) ? configObj.branches : null;
    const generationNames = Array.isArray(configObj && configObj.generationNames) ? configObj.generationNames : null;
    await setConfig({ branches, generationNames });
    return getConfig();
  }

  global.MembersDB = {
    initDB,
    clearStore,
    resetDB,
    addMember,
    updateMember,
    deleteMember,
    getMemberByUUID,
    getMemberById,
    queryMembers,
    exportMembers,
    importMembers,
    getConfig,
    setConfig,
    exportConfig,
    importConfig,
    // 新增：家族/管理草稿持久化
    getFamilyMgmt,
    setFamilyMgmt,
    exportFamilyMgmt,
    importFamilyMgmt,
    CONFIG
  };
// 内部辅助：直接更新部分字段（不触发关系同步递归）
async function updateFieldsDirect(member_uuid, updates){
  const db = await openDB();
  const result = await new Promise((resolve) => {
    const tx = db.transaction(STORE,'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(member_uuid);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if(!existing){ resolve(null); return; }
      const merged = { ...existing, ...updates, updated_at: nowISO() };
      const putReq = store.put(merged);
      putReq.onsuccess = () => resolve(merged);
      putReq.onerror = () => resolve(null);
    };
    getReq.onerror = () => resolve(null);
  });
  db.close();
  return result;
}

async function addChildToParent(parent_uuid, child_uuid){
  const db = await openDB();
  const ok = await new Promise((resolve) => {
    const tx = db.transaction(STORE,'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(parent_uuid);
    getReq.onsuccess = () => {
      const parent = getReq.result;
      if(!parent){ resolve(false); return; }
      const set = new Set(parent.child_id || []);
      if(set.has(child_uuid)){ resolve(false); return; }
      const next = { ...parent, child_id: [...set, child_uuid], updated_at: nowISO() };
      const putReq = store.put(next);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => resolve(false);
    };
    getReq.onerror = () => resolve(false);
  });
  db.close();
  return ok;
}

async function removeChildFromParent(parent_uuid, child_uuid){
  const db = await openDB();
  const ok = await new Promise((resolve) => {
    const tx = db.transaction(STORE,'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(parent_uuid);
    getReq.onsuccess = () => {
      const parent = getReq.result;
      if(!parent){ resolve(false); return; }
      const arr = (parent.child_id || []).filter(x => x !== child_uuid);
      const next = { ...parent, child_id: arr, updated_at: nowISO() };
      const putReq = store.put(next);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => resolve(false);
    };
    getReq.onerror = () => resolve(false);
  });
  db.close();
  return ok;
}


// 在新增/更新后确保关系双向同步（闭包内部可访问内部辅助函数）
async function ensureRelationsOnSave(saved, previous){
  const meUUID = saved.member_uuid;
  if(previous && previous.father_id && previous.father_id !== saved.father_id){
    await removeChildFromParent(previous.father_id, meUUID);
  }
  if(previous && previous.mother_id && previous.mother_id !== saved.mother_id){
    await removeChildFromParent(previous.mother_id, meUUID);
  }
  if(saved.father_id){
    await addChildToParent(saved.father_id, meUUID);
  }
  if(saved.mother_id){
    await addChildToParent(saved.mother_id, meUUID);
  }
  if(previous && previous.spouse_id && previous.spouse_id !== saved.spouse_id){
    const oldSpouse = await getMemberByUUID(previous.spouse_id);
    if(oldSpouse && oldSpouse.spouse_id === meUUID){
      await updateFieldsDirect(oldSpouse.member_uuid, { spouse_id: '' });
    }
  }
  if(saved.spouse_id){
    const spouse = await getMemberByUUID(saved.spouse_id);
    if(spouse && spouse.spouse_id !== meUUID){
      await updateFieldsDirect(spouse.member_uuid, { spouse_id: meUUID });
    }
  }
  const isFather = (saved.gender||'').trim() === '男';
  const isMother = (saved.gender||'').trim() === '女';
  if(Array.isArray(saved.child_id)){
    for(const cid of saved.child_id){
      const child = await getMemberByUUID(cid);
      if(!child) continue;
      if(isFather && child.father_id !== meUUID){
        await updateFieldsDirect(child.member_uuid, { father_id: meUUID });
      }
      if(isMother && child.mother_id !== meUUID){
        await updateFieldsDirect(child.member_uuid, { mother_id: meUUID });
      }
    }
  }
}

})(window);
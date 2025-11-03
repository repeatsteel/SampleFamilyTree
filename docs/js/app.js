/*
  FamilyTree4 UI Renderer
  - 入口脚本：加载 FamilyDBConfig 并渲染信息 / 成员列表 / 树
  - 依赖：Data/FamilyDB.js、lib/familytree.js
  - 交互：滚轮缩放/拖拽、成员详情弹层、视图切换
  - 注意：iframe 目标路径由构建脚本根据 PathMode 修补
*/
(function(){
  // 数据载入
  const DB = window.FamilyDBConfig || {};
  const family = DB.family || {};
  const config = DB.config || {};
   const bioMaxLen = Number(config.bioMaxLen) || 180;
  const members = Array.isArray(DB.members) ? DB.members : [];
  const management = DB.management || {};

  const branches = (config.branches||[]).map(b=>({ id:(b.id||'').toUpperCase(), name:b.name||b.id||'', description:b.description||'' }));
  const genDefs = (config.generationNames||[]).map(g=>({ generation:Number(g.generation)||0, names:Array.isArray(g.names)?g.names:[] }));
  const updateTime = config.updated_at || '';

  const byUUID = new Map(members.map(m=>[m.member_uuid, m]));
  const byCard = new Map();
  const byNode = new Map();
  const gensInData = Array.from(new Set(members.map(m=>Number(m.generation)||0))).filter(Boolean).sort((a,b)=>a-b);
  const genToNames = new Map(genDefs.map(g=>[g.generation, g.names]));
  const branchIdToName = new Map(branches.map(b=>[b.id, b.name]));

  // DOM refs
  const elInfo = document.getElementById('familyInfoBlock');
  const elBranches = document.getElementById('branchesBlock');
  const elGen = document.getElementById('generationBlock');
  const elUpdate = document.getElementById('updateTime');
  const elManagement = document.getElementById('managementBlock');
  const elManagementSection = document.getElementById('managementSection');

  const elSearch = document.getElementById('searchInput');
  const elBranchSelect = document.getElementById('branchSelect');
  const elGenSelect = document.getElementById('generationSelect');
  const elReset = document.getElementById('resetFilters');
  const elMembersGrid = document.getElementById('membersGrid');
  const elViewModeSelect = document.getElementById('viewModeSelect');
  const elViewModeBtnTable = document.getElementById('viewModeBtnTable');
  const elViewModeBtnCard = document.getElementById('viewModeBtnCard');
  const elExportCsvBtn = document.getElementById('exportCsvBtn');
 
   const elTreeContainer = document.getElementById('treeContainer');
  const elTreeRows = document.getElementById('treeRows');
  const elTreeLines = document.getElementById('treeLines');
  const elBftContainer = document.getElementById('bftContainer');
  // Rows 视图过滤/折叠工具条元素
  const elRowsFiltersBar = document.getElementById('rowsFiltersBar');
  const elRowsBranchFilters = document.getElementById('rowsBranchFilters');
  const elRowsShowAllBtn = document.getElementById('rowsShowAllBtn');
  const elRowsCollapseAllBtn = document.getElementById('rowsCollapseAllBtn');
  const elRowsExpandAllBtn = document.getElementById('rowsExpandAllBtn');
  let bftInstance = null;

  // 渲染：家族基本信息
  function renderFamilyInfo(){
    // 动态获取 DOM 元素，避免在脚本过早执行时拿到 null
    const infoEl = document.getElementById('familyInfoBlock');
    const updateEl = document.getElementById('updateTime');
    if(!infoEl || !updateEl){
      try{ console.error('[BFT] familyInfoBlock/updateTime not found, skip render'); }catch(_){ /* noop */ }
      return;
    }
    infoEl.innerHTML = '';
    const items = [
      { k:'姓氏', v: family.surname || '' },
      { k:'发源地', v: family.origin || '' },
      { k:'创立年份', v: family.foundingYear || '' },
      { k:'简介', v: family.description || '' },
      { k:'分支数量', v: String(branches.length) },
      { k:'成员总数', v: String(members.length) }
    ];
    for(const it of items){
      const div = document.createElement('div');
      div.className = 'kv bg-white border border-gray-200 rounded-xl p-3';
      const isDesc = it.k==='简介';
      const vClass = isDesc ? 'v text-gray-700 text-sm leading-relaxed whitespace-pre-line' : 'v font-semibold text-gray-700';
      const iconMap = { '姓氏':'fa-user', '发源地':'fa-map-marker', '创立年份':'fa-calendar', '简介':'fa-align-left', '分支数量':'fa-code-fork', '成员总数':'fa-users' };
      const icon = iconMap[it.k] || 'fa-tag';
      // 更精准的值格式
      let vDisplay = it.v || '';
      if(it.k==='创立年份'){
        const year = parseInt(vDisplay, 10);
        vDisplay = isNaN(year) ? (vDisplay||'-') : `${year} 年`;
      } else if(it.k==='分支数量'){
        vDisplay = `${branches.length} 个分支`;
      } else if(it.k==='成员总数'){
        vDisplay = `${members.length} 位成员`;
      }
      // 简介折叠/展开
      if(isDesc){
        const descText = String(vDisplay || '');
        const isLong = descText.length > 140;
        const short = isLong ? (descText.slice(0,140) + '…') : descText;
        div.innerHTML = `<div class="k"><span class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 text-sm"><i class="fa ${icon}"></i><span>${it.k}</span></span></div><div class="${vClass}"><span class="desc-text">${short||'-'}</span>${isLong?` <button type="button" class="desc-toggle text-blue-600 text-xs ml-2">展开</button>`:''}</div>`;
        const toggle = div.querySelector('.desc-toggle');
        if(toggle){
          let expanded = false;
          const textEl = div.querySelector('.desc-text');
          toggle.addEventListener('click', ()=>{
            expanded = !expanded;
            toggle.textContent = expanded ? '收起' : '展开';
            textEl.textContent = expanded ? descText : short;
          });
        }
      } else {
        div.innerHTML = `<div class="k"><span class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 text-sm"><i class="fa ${icon}"></i><span>${it.k}</span></span></div><div class="${vClass}">${vDisplay||'-'}</div>`;
      }
      infoEl.appendChild(div);
    }
    updateEl.textContent = updateTime ? `配置更新时间：${new Date(updateTime).toLocaleString()}` : '';
  }

// 状态判断：支持 active/enable/enabled/on/true
function isActiveStatus(s){
  const v = (s||'').toString().trim().toLowerCase();
  return v==='active' || v==='enable' || v==='enabled' || v==='on' || v==='running' || s===true;
}

// 渲染：家族管理团队（位于分支模块上方）
function renderManagementTeam(){
  if(!elManagement){ return; }
  // 根据状态控制显示
  const visible = management && isActiveStatus(management.status);
  if(elManagementSection){ elManagementSection.style.display = visible ? '' : 'none'; }
  if(!visible){ return; }

  elManagement.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'divide-y divide-gray-200 bg-white border border-gray-200 rounded-xl overflow-hidden';

  // 顶部简介与公共联络
  const descLi = document.createElement('div');
  descLi.className = 'p-3';
  const desc = (management.description||'').toString();
  const contact = management.publicContact || {};
  descLi.innerHTML = `
    ${desc ? `<div class="text-gray-700">${desc}</div>` : ''}
    ${contact.officeAddress || contact.officePhone || contact.officeEmail || contact.officialWebsite || contact.wechatOfficial ? `
      <div class="mt-2 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 text-sm text-gray-600">
        ${contact.officeAddress ? `<div class="inline-flex items-center gap-2"><i class='fa fa-map-marker'></i><span>${contact.officeAddress}</span></div>`:''}
        ${contact.officePhone ? `<div class="inline-flex items-center gap-2"><i class='fa fa-phone'></i><span>${contact.officePhone}</span></div>`:''}
        ${contact.officeEmail ? `<div class="inline-flex items-center gap-2"><i class='fa fa-envelope'></i><span>${contact.officeEmail}</span></div>`:''}
        ${contact.officialWebsite ? `<div class="inline-flex items-center gap-2"><i class='fa fa-globe'></i><a class='text-blue-600 hover:underline' href='${contact.officialWebsite}' target='_blank' rel='noopener'>官方网站</a></div>`:''}
        ${contact.wechatOfficial ? `<div class="inline-flex items-center gap-2"><i class='fa fa-wechat'></i><span>${contact.wechatOfficial}</span></div>`:''}
      </div>
    `:''}
  `;
  wrapper.appendChild(descLi);

  // 职位列表
  const positions = Array.isArray(management.positions) ? management.positions : [];
  positions.forEach(pos=>{
    const li = document.createElement('div');
    li.className = 'p-3 flex flex-col gap-2';

    const topRow = document.createElement('div');
    topRow.className = 'flex items-center justify-between';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-2';
    left.innerHTML = `
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
        <i class="fa fa-id-badge"></i>
        <span>${pos.title||pos.id||'未知职位'}</span>
        ${pos.id ? `<span class="text-xs text-gray-500">(${pos.id})</span>`:''}
      </span>
    `;

    const right = document.createElement('div');
    right.className = 'flex items-center gap-2';
    const holderName = (pos.currentHolder && pos.currentHolder.name) ? pos.currentHolder.name : '待任';
    const holderBadge = document.createElement('span');
    holderBadge.className = 'inline-flex items-center px-2 py-1 rounded border bg-gray-50 text-gray-700 text-xs border-gray-200 hover:bg-gray-100';
    holderBadge.innerHTML = `<i class="fa fa-user"></i><span class="ml-1">现任：${holderName}</span>`;
    right.appendChild(holderBadge);

    topRow.appendChild(left);
    topRow.appendChild(right);

    const descRow = document.createElement('div');
    descRow.className = 'text-gray-600 text-sm';
    const resp = Array.isArray(pos.responsibilities) ? pos.responsibilities.join('、') : '';
    descRow.textContent = resp ? `职责：${resp}` : '';

    // 联系方式（可选）
    const contactRow = document.createElement('div');
    contactRow.className = 'text-gray-500 text-xs';
    const c = (pos.currentHolder && pos.currentHolder.contact) || {};
    const parts = [];
    if(c.phone) parts.push(`电话：${c.phone}`);
    if(c.email) parts.push(`邮箱：${c.email}`);
    if(c.wechat) parts.push(`微信：${c.wechat}`);
    contactRow.textContent = parts.length ? parts.join(' ｜ ') : '';

    li.appendChild(topRow);
    if(resp) li.appendChild(descRow);
    if(parts.length) li.appendChild(contactRow);
    wrapper.appendChild(li);
  });

  elManagement.appendChild(wrapper);
}

  // 渲染：分支列表（含描述与快速筛选）
  function renderBranches(){
    elBranches.innerHTML='';
    const ul = document.createElement('ul');
    ul.className = 'divide-y divide-gray-200 bg-white border border-gray-200 rounded-xl overflow-hidden';
    branches.forEach(b=>{
      const count = members.filter(m=> normalizeStr(m.branch_char).toUpperCase() === b.id ).length;
      const li = document.createElement('li');
      // 统一为上下两行：上行左右布局（名称/成员），下行放分支介绍
      li.className = 'p-3 flex flex-col gap-2';
      const topRow = document.createElement('div');
      topRow.className = 'flex items-center justify-between';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-2';
      left.innerHTML = `
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
          <i class="fa fa-code-fork text-gray-500"></i>
          <span>${b.name}</span>
          <span class="text-xs text-gray-500">(${b.id})</span>
        </span>
      `;

      const right = document.createElement('div');
      right.className = 'flex items-center gap-2';
      const countBadge = document.createElement('span');
      countBadge.className = 'inline-flex items-center px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      countBadge.textContent = `成员：${count}`;
      right.appendChild(countBadge);

      topRow.appendChild(left);
      topRow.appendChild(right);

      const descRow = document.createElement('div');
      descRow.className = 'text-gray-600 text-sm';
      descRow.textContent = b.description || '';

      li.appendChild(topRow);
      li.appendChild(descRow);
      ul.appendChild(li);
    });
    elBranches.appendChild(ul);
  }

  // 渲染：字辈/世系列表
  function renderGenerations(){
    elGen.innerHTML='';
    const ul = document.createElement('ul');
    ul.className = 'divide-y divide-gray-200 bg-white border border-gray-200 rounded-xl overflow-hidden';
    const gensSorted = genDefs.slice().sort((a,b)=>a.generation-b.generation);
    gensSorted.forEach(g=>{
      const names = g.names.join('、');
      const count = members.filter(m=> Number(m.generation) === g.generation ).length;
      const li = document.createElement('li');
      // 统一为上下两行结构（当前仅有上行：世代与成员左右布局）
      li.className = 'p-3 flex flex-col gap-2';

      const topRow = document.createElement('div');
      topRow.className = 'flex items-center justify-between';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-2';
      left.innerHTML = `
        <span class="no inline-flex items-center px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 text-sm">第 ${g.generation} 世</span>
        <span class="text-gray-700">${names||'-'}</span>
      `;

      const right = document.createElement('div');
      right.className = 'flex items-center gap-2';
      const countBadge = document.createElement('span');
      countBadge.className = 'inline-flex items-center px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 text-xs';
      countBadge.textContent = `成员：${count}`;
      right.appendChild(countBadge);

      topRow.appendChild(left);
      topRow.appendChild(right);

      li.appendChild(topRow);
      ul.appendChild(li);
    });
    elGen.appendChild(ul);
  }

  // 过滤控件
  function setupFilters(){
    // 仅初始化一次事件绑定，避免重复
    if(elBranchSelect && elBranchSelect.dataset.bound) return;
    // branch
    elBranchSelect.innerHTML = '<option value="">全部分支</option>' + branches.map(b=>`<option value="${b.id}">${b.name}</option>`).join('');
    // generation
    const genOptsSet = new Set([].concat(gensInData, genDefs.map(g=>g.generation)));
    const genOpts = Array.from(genOptsSet).filter(Boolean).sort((a,b)=>a-b);
    elGenSelect.innerHTML = '<option value="">全部世系</option>' + genOpts.map(g=>`<option value="${g}">第 ${g} 世</option>`).join('');
    // view mode
    if(elViewModeSelect){ elViewModeSelect.value = state.viewMode; }
    elReset.addEventListener('click', ()=>{ elSearch.value=''; elBranchSelect.value=''; elGenSelect.value=''; state.page=1; renderMembers(); });
    elSearch.addEventListener('input', debounce(()=>{ state.page=1; renderMembers(); }, 200));
    elBranchSelect.addEventListener('change', ()=>{ state.page=1; renderMembers(); });
    elGenSelect.addEventListener('change', ()=>{ state.page=1; renderMembers(); });
    if(elViewModeSelect){ elViewModeSelect.addEventListener('change', ()=>{ state.viewMode = elViewModeSelect.value==='card' ? 'card' : 'table'; state.page=1; renderMembers(); }); }
    // 标记已绑定
    elBranchSelect.dataset.bound='1';
    elGenSelect.dataset.bound='1';
    elSearch.dataset.bound='1';
    elReset.dataset.bound='1';
    if(elViewModeSelect) elViewModeSelect.dataset.bound='1';
  }

  function normalizeStr(s){ return (s||'').toString().trim(); }
  function initials(name){
    const s = normalizeStr(name);
    // 取前1-2个字符作为头像文本（中文兼容）
    return s ? s.slice(0,2) : '?';
  }
  function debounce(fn, wait){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); }; }
  function throttle(fn, wait){ let last=0; return (...args)=>{ const now=Date.now(); if(now-last>wait){ last=now; fn(...args); } }; }
  function branchToneClasses(id){
    const key=(id||'').toUpperCase();
    const fixedMap = { ZHON:'sky', XIAM:'emerald', GUAN:'teal', SHAN:'amber', SANX:'orange', SICH:'violet', TAIW:'rose', SING:'cyan', MALA:'lime', USAZ:'indigo' };
    const firstLetterMap = { Z:'sky', X:'emerald', G:'teal', S:'amber', T:'rose', M:'lime', U:'indigo' };
    const color = fixedMap[key] || firstLetterMap[key.slice(0,1)] || 'slate';
    return `bg-${color}-50 text-${color}-700 border-${color}-200 hover:bg-${color}-100`;
  }

  const state = { page: 1, pageSize: 40, viewMode: 'card', sortKey: 'name', sortAsc: true, lastFiltered: [], rowsSelectedBranches: new Set(), rowsCollapsedGens: new Set(), showLines: true, hoverOnlyLines: true, hoveredUuid: '' };
  function ensurePaginationBar(){ let bar=document.getElementById('paginationBar'); if(!bar){ bar=document.createElement('div'); bar.id='paginationBar'; bar.className='pagination flex items-center justify-center gap-2 mt-3'; const container = document.getElementById('membersTableWrapper') || elMembersGrid; container.parentNode.insertBefore(bar, container.nextSibling); } return bar; }
  function renderPagination(total){ const bar=ensurePaginationBar(); const totalPages=Math.ceil(total/state.pageSize); if(totalPages<=1){ bar.innerHTML=''; return; } const prevDisabled = state.page<=1 ? 'opacity-50 pointer-events-none' : ''; const nextDisabled = state.page>=totalPages ? 'opacity-50 pointer-events-none' : ''; bar.innerHTML = `<button class="px-3 py-1 border rounded ${prevDisabled}" data-act="prev">上一页</button><span class="text-sm text-gray-600">第 ${state.page} / ${totalPages} 页（共 ${total} 人）</span><button class="px-3 py-1 border rounded ${nextDisabled}" data-act="next">下一页</button>`; bar.querySelectorAll('button[data-act]').forEach(btn=>{ btn.onclick = ()=>{ const act=btn.dataset.act; if(act==='prev' && state.page>1){ state.page--; } else if(act==='next' && state.page<totalPages){ state.page++; } renderMembers(); window.scrollTo({ top: document.getElementById('members').offsetTop - 80, behavior:'smooth'}); }; }); }

  // 渲染成员卡片
  function renderMembersGrid(){
    const q = normalizeStr(elSearch.value).toLowerCase();
    const b = normalizeStr(elBranchSelect.value).toUpperCase();
    const g = Number(elGenSelect.value)||0;
    const list = members.filter(m=>{
      const name = normalizeStr(m.name).toLowerCase();
      const occ = normalizeStr(m.occupation).toLowerCase();
      const zi = normalizeStr(m.zi).toLowerCase();
      const branchChar = normalizeStr(m.branch_char).toUpperCase();
      const gen = Number(m.generation)||0;
      let ok = true;
      if(q && !(name.includes(q) || occ.includes(q) || zi.includes(q))) ok=false;
      if(b && branchChar !== b) ok=false;
      if(g && gen !== g) ok=false;
      return ok;
    });
    // 保存当前筛选结果（供懒加载与导出使用）
    state.lastFiltered = list;
    const totalPages = Math.ceil(list.length/state.pageSize) || 1;
    if(state.page>totalPages) state.page = totalPages;
    const start = (state.page-1)*state.pageSize;
    const paged = list.slice(start, start+state.pageSize);
    // 显示卡片容器，隐藏表格容器
    const wrapper = document.getElementById('membersTableWrapper');
    if(wrapper) wrapper.classList.add('hidden');
    if(elMembersGrid) elMembersGrid.classList.remove('hidden');
    elMembersGrid.innerHTML='';
    byCard.clear();

    const createCard = (m)=>{
      const card = document.createElement('div');
      card.className='card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition';
      card.dataset.uuid = m.member_uuid;
      const branchName = branchIdToName.get(normalizeStr(m.branch_char).toUpperCase()) || m.branch_name || '';
      const title = normalizeStr(m.name) || m.member_uuid;
      const sub = [normalizeStr(m.gender), normalizeStr(m.birth_date), normalizeStr(m.death_date)].filter(Boolean).join(' · ');
      const avatar = m.photo ? `<img class="avatar-img w-12 h-12 rounded-full object-cover border border-gray-200" src="${m.photo}" alt="${title}" loading="lazy" onerror="this.remove(); this.closest('.avatar').textContent='${initials(m.name)}';" />` : initials(m.name);
      const tagHtmls = [];
      if(m.zi) tagHtmls.push(`<span class="tag inline-flex items-center gap-1 mr-1 mt-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" role="button" data-type="zi" data-value="${normalizeStr(m.zi)}"><i class="fa fa-id-badge"></i><span>字辈：${m.zi}</span></span>`);
      if(m.occupation) tagHtmls.push(`<span class="tag inline-flex items-center gap-1 mr-1 mt-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" role="button" data-type="occupation" data-value="${normalizeStr(m.occupation)}"><i class="fa fa-briefcase"></i><span>职业：${m.occupation}</span></span>`);
      if(branchName) tagHtmls.push(`<span class="tag inline-flex items-center gap-1 mr-1 mt-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" role="button" data-type="branch" data-value="${normalizeStr(m.branch_char).toUpperCase()}"><i class="fa fa-code-fork text-gray-500"></i><span>分支：${branchName}</span></span>`);
      if(m.generation) tagHtmls.push(`<span class="tag inline-flex items-center gap-1 mr-1 mt-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" role="button" data-type="generation" data-value="${Number(m.generation)}"><i class="fa fa-sort-numeric-asc"></i><span>第${m.generation}世</span></span>`);
      // 年龄标签（根据生卒日期计算）
      const ageText = (()=>{
        const bdStr = normalizeStr(m.birth_date);
        const ddStr = normalizeStr(m.death_date);
        if(!bdStr) return '';
        const bd = new Date(bdStr);
        if(isNaN(bd.getTime())) return '';
        const ref = ddStr ? new Date(ddStr) : new Date();
        if(isNaN(ref.getTime())) return '';
        let age = ref.getFullYear() - bd.getFullYear();
        const mo = ref.getMonth() - bd.getMonth();
        if(mo < 0 || (mo === 0 && ref.getDate() < bd.getDate())) age--;
        const prefix = ddStr ? '享年' : '现年';
        return `${prefix}${age}岁`;
      })();
      if(ageText) tagHtmls.push(`<span class="tag inline-flex items-center gap-1 mr-1 mt-1 px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"><i class="fa fa-birthday-cake"></i><span>${ageText}</span></span>`);
      const bioText = normalizeStr(m.bio);
       const maxBioLen = bioMaxLen;
       const isLongBio = !!bioText && bioText.length > maxBioLen;
       const bioShort = isLongBio ? (bioText.slice(0, maxBioLen) + '…') : bioText;
      card.innerHTML = `
        <div class="top flex gap-3 p-3 border-b border-gray-200 items-center">
          <div class="avatar w-12 h-12 inline-flex items-center justify-center bg-gray-100 rounded-full text-gray-700 font-semibold relative overflow-hidden" title="${title}">${avatar}</div>
          <div class="body">
            <div class="name text-lg font-semibold">${title}</div>
            ${sub ? `<div class=\"meta text-gray-500 text-sm\">${sub}</div>` : ``}
          </div>
        </div>
        <div class="body p-3 text-sm">
          ${tagHtmls.join('')}
          ${bioText ? `<div class=\"meta mt-2 whitespace-pre-line text-gray-700\"><span class=\"bio-text\">${bioShort}</span>${isLongBio ? ` <button type=\"button\" class=\"bio-toggle text-blue-600 text-xs ml-2\">展开</button>` : ''}</div>` : ``}
        </div>
      `;
      // 简介折叠/展开
      if(isLongBio){
        const toggle = card.querySelector('.bio-toggle');
        const textEl = card.querySelector('.bio-text');
        if(toggle && textEl){
          let expanded = false;
          toggle.addEventListener('click', (ev)=>{
            ev.stopPropagation();
            expanded = !expanded;
            toggle.textContent = expanded ? '收起' : '展开';
            textEl.textContent = expanded ? bioText : bioShort;
          });
        }
      }
      card.addEventListener('click', ()=>showMemberDetail(m.member_uuid));
      // 标签点击快速过滤
      card.querySelectorAll('.tag').forEach(t=>{
        t.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          const type = t.dataset.type; const val = t.dataset.value;
          if(type==='branch'){ elBranchSelect.value = val; state.page=1; renderMembers(); }
          else if(type==='generation'){ elGenSelect.value = val; state.page=1; renderMembers(); }
          else if(type==='occupation' || type==='zi'){ elSearch.value = val; state.page=1; renderMembers(); }
        });
      });
      return card;
    };

    // 首次渲染当前页
    paged.forEach(m=>{
      const card = createCard(m);
      elMembersGrid.appendChild(card);
      byCard.set(m.member_uuid, card);
    });

    // 懒加载：滚动至底部自动追加下一页
    let sentinel = document.getElementById('gridLazySentinel');
    if(!sentinel){
      sentinel = document.createElement('div');
      sentinel.id = 'gridLazySentinel';
      sentinel.className = 'h-8';
      elMembersGrid.appendChild(sentinel);
    }
    if(!elMembersGrid.dataset.lazyBound){
      const io = new IntersectionObserver(entries=>{
        entries.forEach(e=>{
          if(e.isIntersecting && state.viewMode==='card'){
            const totalPages = Math.ceil((state.lastFiltered||[]).length/state.pageSize) || 1;
            if(state.page < totalPages){
              const start = state.page*state.pageSize;
              const slice = state.lastFiltered.slice(start, start+state.pageSize);
              slice.forEach(m=>{
                const card = createCard(m);
                elMembersGrid.insertBefore(card, sentinel);
                byCard.set(m.member_uuid, card);
              });
              state.page++;
              renderPagination(state.lastFiltered.length);
            }
          }
        });
      }, { rootMargin: '200px' });
      io.observe(sentinel);
      elMembersGrid.dataset.lazyBound='1';
    }

    renderPagination(list.length);
  }

  // 渲染成员表格（轻量、加载更快）
  function renderMembersTable(){
    const q = normalizeStr(elSearch.value).toLowerCase();
    const b = normalizeStr(elBranchSelect.value).toUpperCase();
    const g = Number(elGenSelect.value)||0;
    const list = members.filter(m=>{
      const name = normalizeStr(m.name).toLowerCase();
      const occ = normalizeStr(m.occupation).toLowerCase();
      const zi = normalizeStr(m.zi).toLowerCase();
      const branchChar = normalizeStr(m.branch_char).toUpperCase();
      const gen = Number(m.generation)||0;
      let ok = true;
      if(q && !(name.includes(q) || occ.includes(q) || zi.includes(q))) ok=false;
      if(b && branchChar !== b) ok=false;
      if(g && gen !== g) ok=false;
      return ok;
    });
    // 保存当前筛选结果，供导出使用
    state.lastFiltered = list;
    // 根据排序键进行排序
    const key = state.sortKey; const asc = state.sortAsc?1:-1;
    const getVal = (m)=>{ switch(key){
      case 'name': return normalizeStr(m.name);
      case 'gender': return normalizeStr(m.gender);
      case 'zi': return normalizeStr(m.zi);
      case 'generation': return Number(m.generation)||0;
      case 'branch_char': return normalizeStr(m.branch_char).toUpperCase();
      case 'birth_date': return normalizeStr(m.birth_date);
      case 'occupation': return normalizeStr(m.occupation);
      default: return normalizeStr(m.name);
    }};
    const sorted = list.slice().sort((m1,m2)=>{
      const a=getVal(m1), b=getVal(m2);
      if(typeof a==='number' || typeof b==='number'){
        return (Number(a)-Number(b))*asc;
      }
      return (a>b?1:a<b?-1:0)*asc;
    });
    const totalPages = Math.ceil(sorted.length/state.pageSize) || 1;
    if(state.page>totalPages) state.page = totalPages;
    const start = (state.page-1)*state.pageSize;
    const paged = sorted.slice(start, start+state.pageSize);
    const wrapper = document.getElementById('membersTableWrapper');
    const table = document.getElementById('membersTable');
    if(wrapper) wrapper.classList.remove('hidden');
    if(elMembersGrid) elMembersGrid.classList.add('hidden');
    if(!table) return;
    const tbody = table.querySelector('tbody');
    if(!tbody) return;
    tbody.innerHTML = paged.map(m=>{
      const branchName = branchIdToName.get(normalizeStr(m.branch_char).toUpperCase()) || m.branch_name || '';
      const birth = normalizeStr(m.birth_date);
      const death = normalizeStr(m.death_date);
      return `<tr class="hover:bg-gray-50 cursor-pointer" data-uuid="${m.member_uuid}">
        <td class="px-3 py-2">${normalizeStr(m.name)||m.member_uuid}</td>
        <td class="px-3 py-2">${normalizeStr(m.gender)}</td>
        <td class="px-3 py-2">${normalizeStr(m.zi)}</td>
        <td class="px-3 py-2">${Number(m.generation)||''}</td>
        <td class="px-3 py-2">${branchName}</td>
        <td class="px-3 py-2">${[birth, death].filter(Boolean).join(' — ')}</td>
        <td class="px-3 py-2">${normalizeStr(m.occupation)}</td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('tr[data-uuid]').forEach(tr=>{
      tr.addEventListener('click', ()=>showMemberDetail(tr.dataset.uuid));
    });
    renderPagination(list.length);
  }

  // 宝塔形树：按世系分行居中
  function renderTree(){
    console.log('[BFT] renderTree start', { containerExists: !!elBftContainer });
    // 使用 Balkan FamilyTreeJS 渲染
    if(!elBftContainer){ return; }
    // 清空容器，准备渲染（改为内部挂载，以便视口缩放/拖动）
    elBftContainer.innerHTML = '<div id="bftInner" class="bft-inner w-full h-full"></div>';
    // 重置视口交互绑定标记，确保新渲染使用最新的缩放/平移实现
    try{ delete elBftContainer.dataset.viewportBound; }catch(e){}
    // 强制重新初始化实例，避免旧实例挂载在外层容器
    bftInstance = null;
    const hostSelector = '#bftInner';
    // 节点数据映射（满足规则：同代同行、同代按出生排序、夫妻男左女右；存在关系缺口则不连线）
    const idSet = new Set(members.map(x=> x.member_uuid));
    const nodesRaw = members.map(m=>{
      const genderNorm = (normalizeStr(m.gender)||'').toLowerCase();
      const isFemale = genderNorm.includes('女') || genderNorm.includes('female') || genderNorm==='f';
      const node = {
        id: m.member_uuid,
        name: normalizeStr(m.name)||m.member_uuid,
        born: normalizeStr(m.birth_date)||'',
        died: normalizeStr(m.death_date)||'',
        gender: isFemale ? 'female' : 'male',
        // 直接使用数据库中的世代编号（优先），缺失则后续回退为1
        generation: Number(m.generation) || null
      };
      // 父母关系：仅当父与母都存在于数据集中时建立连线（避免数据缺口时仍画线）
      const hasFather = !!m.father_id && idSet.has(m.father_id);
      const hasMother = !!m.mother_id && idSet.has(m.mother_id);
      if(hasFather && hasMother){ node.fid = m.father_id; node.mid = m.mother_id; }
      // 夫妻关系：仅当配偶存在于数据集中时建立；并由男性侧标注，保证男左女右
      const hasSpouse = !!m.spouse_id && idSet.has(m.spouse_id);
      // 夫妻关系：为双方都设置 pids，避免仅男性设置导致个别配偶未连线的情况
      if(hasSpouse){ node.pids = [m.spouse_id]; }
      return node;
    });
    // 关系索引（用于多家族排序锚点）
    const parentsMap = new Map();
    nodesRaw.forEach(n=>{ parentsMap.set(n.id, { fid: n.fid, mid: n.mid }); });
    // 回退：若个别成员未设置世代，则设为第1世
    nodesRaw.forEach(n=>{ if(n.generation == null) n.generation = 1; });
    // 辅助：找到节点的根祖先（用于多家族左→右排序）
    const rootCache = new Map();
    function findRootId(id){
      if(rootCache.has(id)) return rootCache.get(id);
      let cur = id, safety = 0;
      while(safety++ < 1000){
        const p = parentsMap.get(cur);
        if(!p || (!p.fid && !p.mid)) break;
        // 若同时存在父母，优先沿父系上溯（仅用于排序锚点，无实际血缘偏好）
        cur = p.fid || p.mid || cur;
        if(cur === id) break;
      }
      rootCache.set(id, cur);
      return cur;
    }
    function bornSortable(dateStr){ const s = String(dateStr||'').trim(); return s || '9999-99-99'; }
    const rootBornCache = new Map();
    function getRootBorn(id){
      const rid = findRootId(id);
      if(rootBornCache.has(rid)) return rootBornCache.get(rid);
      const rn = nodesRaw.find(x=> x.id === rid);
      const b = rn ? bornSortable(rn.born) : '9999-99-99';
      rootBornCache.set(rid, b);
      return b;
    }
    // 全局排序：先按世代（小→大），再按出生（早→晚），再按所属家族根出生（左→右），最后按性别保证夫妻男左女右更稳定
    const nodes = nodesRaw.sort((a,b)=>{
      if(a.generation !== b.generation) return a.generation - b.generation;
      const ba = bornSortable(a.born); const bb = bornSortable(b.born);
      if(ba < bb) return -1; if(ba > bb) return 1;
      const ra = getRootBorn(a.id); const rb = getRootBorn(b.id);
      if(ra < rb) return -1; if(ra > rb) return 1;
      if(a.gender !== b.gender) return a.gender === 'male' ? -1 : 1;
      return String(a.id).localeCompare(String(b.id));
    });
    console.log('[BFT] nodes length', nodes.length);
    const orientation = FamilyTree.orientation.top;
    // 初始化或复用实例
    if(!bftInstance){
      const debugBftDetails = /bftdetails=1/.test(window.location.search) || localStorage.getItem('debugBftDetails') === '1';
      const defaultActionDetails = (window.FamilyTree && FamilyTree.action && FamilyTree.action.details) ? FamilyTree.action.details : FamilyTree.none;
      const hostEl = document.getElementById('bftInner');
      console.log('[BFT] hostEl exists?', !!hostEl);
      try {
        if (window.FamilyTree) {
          FamilyTree.LAZY_LOADING = false;
          console.log('[BFT] FamilyTree.LAZY_LOADING set to', FamilyTree.LAZY_LOADING);
        }
      } catch (e) { /* ignore */ }
      // 响应式配置：手机与PC模式（支持手动覆盖 localStorage.bftResponsiveMode = 'mobile' | 'pc' | 'auto'）
      const modeOverride = (localStorage.getItem('bftResponsiveMode')||'').toLowerCase();
      const autoMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
      const isMobile = modeOverride === 'mobile' ? true : modeOverride === 'pc' ? false : autoMobile;
      const cfg = {
        lazyLoading: false,
        enableTouch: true,
        enablePan: true,
        toolbar: true,
        orientation: orientation,
        // 兼容不同版本的滚轮配置键名（mouseScrool/mouseScroll）
        mouseScrool: FamilyTree.action.zoom,
        mouseScroll: FamilyTree.action.zoom,
        layout: (FamilyTree.layout && FamilyTree.layout.normal) ? FamilyTree.layout.normal : FamilyTree.layout,
        levelSeparation: isMobile ? 64 : 88,
        siblingSeparation: isMobile ? 20 : 26,
        partnerNodeSeparation: isMobile ? 20 : 26,
        minPartnerSeparation: isMobile ? 44 : 54,
        scaleInitial: isMobile ? 0.9 : 0.9,
        orderBy: 'born',
        nodeMouseClick: debugBftDetails ? defaultActionDetails : FamilyTree.none,
        nodeBinding: { field_0: 'name', field_1: 'born', field_2: 'died' }
      };
      bftInstance = new FamilyTree(hostEl, cfg);
      console.log('[BFT] instance created?', !!bftInstance);
      // 节点点击打开详情（兼容不同版本的事件参数）
      const openDetailHandler = function(sender, args){
        try{
          const rawId = args?.id ?? args?.nodeId ?? args?.node?.id ?? args?.node?.nodeId;
          if(rawId != null) {
            const idStr = String(rawId).replace(/^node[-_]?/i, '');
            // 直接按 UUID 打开
            if(byUUID.has(idStr)) { showMemberDetail(idStr); return; }
            // 兼容库用数字 member_id 的情况：尝试按数字匹配并映射回 UUID
            const m = members.find(x => String(x.member_uuid) === idStr || String(x.member_id) === idStr);
            if(m && m.member_uuid) { showMemberDetail(m.member_uuid); return; }
            console.warn('[BFT] click id not found in byUUID', rawId, args);
          } else {
            console.warn('[BFT] click event without id', args);
          }
        }catch(e){
          console.error('[BFT] click handler error', e);
        }
      };
      if (bftInstance?.on) {
        bftInstance.on('click', openDetailHandler);
        bftInstance.on('nodeClick', openDetailHandler);
        bftInstance.on('node', function(sender, args){
          if(args && (args.event === 'click' || args.type === 'click')) openDetailHandler(sender, args);
        });
      }
      // DOM 委托兜底：点击任意节点元素时尝试打开详情（不仅限于文本）
      if(elBftContainer && !elBftContainer.dataset.delegateBound){
        elBftContainer.dataset.delegateBound = '1';
        elBftContainer.addEventListener('click', function(evt){
          try{
            const t = evt.target;
            const g = t.closest && t.closest('g');
            if(!g) return;
            const nodeId = g.getAttribute('id') || g.getAttribute('data-id') || (g.dataset?g.dataset.id:'');
            if(nodeId && byUUID.has(nodeId)){ showMemberDetail(nodeId); return; }
            const texts = Array.from(g.querySelectorAll('text,tspan,foreignObject')).map(e=> (e.textContent||'').trim()).filter(Boolean);
            const nameCand = texts.find(s=> s && /[\u4e00-\u9fff]/.test(s) && !/[0-9]/.test(s)) || texts[0];
            if(nameCand){
              const m = members.find(x=>{
                const xn=(x.name||'').trim();
                return xn===nameCand || xn.includes(nameCand) || nameCand.includes(xn);
              });
              if(m && m.member_uuid){ showMemberDetail(m.member_uuid); }
            }
          }catch(e){ /* ignore */ }
        }, true);
      }
      // 全局兜底：库可能将 SVG 插入到 body 下，捕获任意节点元素点击
      if(!window.__bftDocDelegateBound){
        window.__bftDocDelegateBound = '1';
        document.addEventListener('click', function(evt){
          try{
            const t = evt.target;
            const g = t.closest && t.closest('g');
            if(!g) return;
            const nodeId = g.getAttribute('id') || g.getAttribute('data-id') || (g.dataset?g.dataset.id:'');
            if(nodeId && byUUID.has(nodeId)){ showMemberDetail(nodeId); return; }
            const texts = Array.from(g.querySelectorAll('text,tspan,foreignObject')).map(e=> (e.textContent||'').trim()).filter(Boolean);
            const nameCand = texts.find(s=> s && /[\u4e00-\u9fff]/.test(s) && !/[0-9]/.test(s)) || texts[0];
            if(nameCand){
              const m = members.find(x=>{
                const xn=(x.name||'').trim();
                return xn===nameCand || xn.includes(nameCand) || nameCand.includes(xn);
              });
              if(m && m.member_uuid){ showMemberDetail(m.member_uuid); }
            }
          }catch(e){ /* ignore */ }
        }, true);
      }
      // 全局兜底：库可能将 SVG 插入到 body 下，捕获任意节点元素点击
      if(!window.__bftDocDelegateBound){
        window.__bftDocDelegateBound = '1';
        document.addEventListener('click', function(evt){
          try{
            const t = evt.target;
            const g = t.closest && t.closest('g');
            if(!g) return;
            const nodeId = g.getAttribute('id') || g.getAttribute('data-id') || (g.dataset?g.dataset.id:'');
            if(nodeId && byUUID.has(nodeId)){ showMemberDetail(nodeId); return; }
            const texts = Array.from(g.querySelectorAll('text,tspan,foreignObject')).map(e=> (e.textContent||'').trim()).filter(Boolean);
            const nameCand = texts.find(s=> s && /[\u4e00-\u9fff]/.test(s) && !/[0-9]/.test(s)) || texts[0];
            if(nameCand){
              const m = members.find(x=>{
                const xn=(x.name||'').trim();
                return xn===nameCand || xn.includes(nameCand) || nameCand.includes(xn);
              });
              if(m && m.member_uuid){ showMemberDetail(m.member_uuid); }
            }
          }catch(e){ /* ignore */ }
        }, true);
      }
    }
    // 加载并自适应
    bftInstance.load(nodes, function(){
      try{ bftInstance.fit(); }catch(e){}
      // 绑定视口交互（桌面滚轮缩放、拖拽平移，移动端单指拖动/双指捏合）
      try{ attachBftViewportInteractions(); }catch(e){}
      // 事件诊断：仅加日志，不改动交互逻辑
      try{ attachBftDiagnostics(); }catch(e){}
      // 调试：统计页面上 SVG 与节点组数量
      try{
        const svgCnt = document.querySelectorAll('svg').length;
        const gCnt = document.querySelectorAll('svg g').length;
        console.log('[BFT] after load: svgCnt=', svgCnt, 'gCnt=', gCnt);
      }catch(e){}
    });
  }

  // 通用渲染：根据模式选择表格或卡片
  function renderMembers(){
    if(state.viewMode==='card') return renderMembersGrid();
    return renderMembersTable();
  }

  // 成员表格排序（thead点击）
  function setupSorting(){
    const table = document.getElementById('membersTable');
    if(!table) return;
    const thead = table.querySelector('thead');
    if(!thead || thead.dataset.bound) return;
    thead.dataset.bound = '1';

    // 表头 sticky 行为改为由 CSS 类 .table-sticky 统一管理
    // 不再在此处写入行内样式

    const applyIndicator = ()=>{
      thead.querySelectorAll('th[data-sort-key]').forEach(t=>{
        t.classList.remove('bg-gray-100');
        t.setAttribute('aria-sort','none');
        const icon = t.querySelector('.sort-icon');
        if(icon){
          icon.classList.remove('fa-sort-up','fa-sort-down');
          icon.classList.add('fa-sort');
          icon.classList.remove('text-gray-700');
          icon.classList.add('text-gray-400');
        }
      });
      const active = thead.querySelector(`th[data-sort-key="${state.sortKey}"]`);
      if(active){
        active.classList.add('bg-gray-100');
        active.setAttribute('aria-sort', state.sortAsc ? 'ascending' : 'descending');
        const icon = active.querySelector('.sort-icon');
        if(icon){
          icon.classList.remove('fa-sort');
          icon.classList.add(state.sortAsc ? 'fa-sort-up' : 'fa-sort-down');
          icon.classList.remove('text-gray-400');
          icon.classList.add('text-gray-700');
        }
      }
    };
    thead.querySelectorAll('th[data-sort-key]').forEach(th=>{
      th.addEventListener('click', ()=>{
        const key = th.dataset.sortKey;
        if(state.sortKey === key){
          state.sortAsc = !state.sortAsc;
        } else {
          state.sortKey = key;
          state.sortAsc = true;
        }
        applyIndicator();
        renderMembers();
      });
    });
    // 初始设置排序指示
    applyIndicator();
  }

  // 导出当前筛选结果为CSV
  function exportMembersCsv(){
    const list = state.lastFiltered && state.lastFiltered.length ? state.lastFiltered : members;
    const header = ['姓名','性别','字辈','世系','分支','生卒','职业'];
    const rows = list.map(m=>{
      const name = (m.name||'').trim() || m.member_uuid || '';
      const gender = (m.gender||'').trim();
      const zi = (m.zi||'').trim();
      const generation = Number(m.generation)||'';
      const branchId = (m.branch_char||'').toString().toUpperCase();
      const branchName = m.branch_name || branchIdToName.get(branchId) || branchId || '';
      const birthDeath = [m.birth_date||'', m.death_date||''].filter(Boolean).join(' — ');
      const occupation = (m.occupation||'').trim();
      return [name, gender, zi, generation, branchName, birthDeath, occupation];
    });
    const csv = [header].concat(rows).map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function drawLines(rowEls){
    // 若关闭连线显示，则清空并返回
    if(state && state.showLines === false){ if(elTreeLines) elTreeLines.innerHTML = ''; return; }
    // 计算容器尺寸并清空
    const rect = elTreeContainer.getBoundingClientRect();
    elTreeLines.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    elTreeLines.innerHTML = '';
    const mkLine = (x1,y1,x2,y2)=>{
      const p = document.createElementNS('http://www.w3.org/2000/svg','path');
      const midY = (y1+y2)/2;
      const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      p.setAttribute('d', d);
      p.setAttribute('fill','none');
      p.setAttribute('stroke','#cbd5e1');
      p.setAttribute('stroke-width','2');
      return p;
    };
    const containerRect = elTreeContainer.getBoundingClientRect();
    const qNode = (uuid)=> elTreeRows.querySelector(`.node[data-uuid="${uuid}"]`);
    const isVisibleRect = (r)=>{ const top = r.top - containerRect.top; const bottom = r.bottom - containerRect.top; return bottom >= 0 && top <= containerRect.height; };

    const iterateList = (state && state.hoverOnlyLines)
      ? (state.hoveredUuid ? members.filter(m=> (m.member_uuid===state.hoveredUuid) || (((m.father_id||'')===state.hoveredUuid))) : [])
      : members;
    if(state && state.hoverOnlyLines && !state.hoveredUuid){ return; }
    iterateList.forEach(m=>{
      const gen = Number(m.generation)||0;
      const father = m.father_id ? byUUID.get(m.father_id) : null;
      const mother = m.mother_id ? byUUID.get(m.mother_id) : null;
      const childNode = qNode(m.member_uuid);
      if(!childNode) return;
      const childRect = childNode.getBoundingClientRect();
      const childX = childRect.left - containerRect.left + childRect.width/2;
      const childY = childRect.top - containerRect.top;
      // 仅连接上一世的父母（可视区域增量渲染）
      if(father && Number(father.generation)===gen-1){
        const fNode = qNode(father.member_uuid);
        if(fNode){
          const fRect = fNode.getBoundingClientRect();
          if(isVisibleRect(childRect) || isVisibleRect(fRect)){
            const fx = fRect.left - containerRect.left + fRect.width/2;
            const fy = fRect.top - containerRect.top + fRect.height;
            elTreeLines.appendChild(mkLine(fx, fy, childX, childY));
          }
        }
      }
      // 母系连线已禁用：即使母卡片存在也不绘制母→子连线。
    });
  }

  // 按世代行布局渲染（满足同世代同行、出生排序、夫妻男左女右、数据缺口不连线）
  // Rows 视图：分支过滤与世代折叠工具条初始化
  function setupRowsFilters(){
    if(!elRowsFiltersBar || !elRowsBranchFilters) return;
    // 显示连线开关（新增）：允许用户关闭/开启父子连线，减少视觉干扰
    try{ const saved = localStorage.getItem('rowsShowLines'); if(saved !== null){ state.showLines = saved === '1'; } }catch(e){}
    let linesChk = document.getElementById('rowsShowLinesChk');
    if(!linesChk){
      const label = document.createElement('label');
      label.className = 'flex items-center gap-1 ml-auto text-xs text-gray-600';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.id = 'rowsShowLinesChk';
      chk.checked = state.showLines !== false;
      label.appendChild(chk);
      label.appendChild(document.createTextNode('显示连线'));
      elRowsFiltersBar.appendChild(label);
      chk.addEventListener('change', ()=>{
        state.showLines = chk.checked;
        try{ localStorage.setItem('rowsShowLines', chk.checked ? '1' : '0'); }catch(e){ }
        drawLines();
      });
      linesChk = chk;
    } else {
      linesChk.checked = state.showLines !== false;
    }
    // 悬停仅显示连线开关（新增）：只在鼠标悬停某成员卡片时绘制与其相关的连线
    try{ const savedHover = localStorage.getItem('rowsHoverOnlyLines'); if(savedHover !== null){ state.hoverOnlyLines = savedHover === '1'; } }catch(e){}
    let hoverChk = document.getElementById('rowsHoverOnlyLinesChk');
    if(!hoverChk){
      const label2 = document.createElement('label');
      label2.className = 'flex items-center gap-1 text-xs text-gray-600';
      const chk2 = document.createElement('input');
      chk2.type = 'checkbox';
      chk2.id = 'rowsHoverOnlyLinesChk';
      chk2.checked = !!state.hoverOnlyLines;
      label2.appendChild(chk2);
      label2.appendChild(document.createTextNode('仅悬停显示连线'));
      elRowsFiltersBar.appendChild(label2);
      chk2.addEventListener('change', ()=>{
        state.hoverOnlyLines = chk2.checked;
        try{ localStorage.setItem('rowsHoverOnlyLines', chk2.checked ? '1' : '0'); }catch(e){}
        drawLines();
      });
      hoverChk = chk2;
    } else {
      hoverChk.checked = !!state.hoverOnlyLines;
    }
    // 构建分支过滤按钮
    elRowsBranchFilters.innerHTML = '';
    branches.forEach(b=>{
      const btn = document.createElement('button');
      btn.className = 'px-2 py-1 text-xs rounded border border-gray-200';
      btn.dataset.branch = b.id;
      btn.textContent = b.name || b.id;
      const setActive = (on)=>{ if(on){ btn.classList.add('bg-gray-100'); } else { btn.classList.remove('bg-gray-100'); } };
      const isSelected = state.rowsSelectedBranches && state.rowsSelectedBranches.has(b.id);
      setActive(isSelected);
      btn.addEventListener('click', ()=>{
        const sel = state.rowsSelectedBranches || new Set();
        if(sel.has(b.id)) sel.delete(b.id); else sel.add(b.id);
        state.rowsSelectedBranches = sel;
        setActive(sel.has(b.id));
        renderTreeRowsLayout();
      });
      elRowsBranchFilters.appendChild(btn);
    });
    // 全部显示
    if(elRowsShowAllBtn && !elRowsShowAllBtn.dataset.bound){
      elRowsShowAllBtn.dataset.bound = '1';
      elRowsShowAllBtn.addEventListener('click', ()=>{
        state.rowsSelectedBranches = new Set();
        setupRowsFilters();
        renderTreeRowsLayout();
      });
    }
    // 收起/展开全部
    if(elRowsCollapseAllBtn && !elRowsCollapseAllBtn.dataset.bound){
      elRowsCollapseAllBtn.dataset.bound = '1';
      elRowsCollapseAllBtn.addEventListener('click', ()=>{
        const gens = Array.from(new Set(members.map(m=>Number(m.generation)||0))).filter(Boolean);
        state.rowsCollapsedGens = new Set(gens);
        renderTreeRowsLayout();
      });
    }
    if(elRowsExpandAllBtn && !elRowsExpandAllBtn.dataset.bound){
      elRowsExpandAllBtn.dataset.bound = '1';
      elRowsExpandAllBtn.addEventListener('click', ()=>{
        state.rowsCollapsedGens = new Set();
        renderTreeRowsLayout();
      });
    }
  }

  // 按世代行布局渲染（满足同世代同行、出生排序、夫妻男左女右、数据缺口不连线；支持分支过滤与行折叠）
  function renderTreeRowsLayout(){
    if(!elTreeRows || !elTreeContainer) return;
    // 清空旧内容与节点映射
    elTreeRows.innerHTML = '';
    byNode.clear();
    // 选中分支过滤（空集合=显示全部）
    const selected = state.rowsSelectedBranches || new Set();
    const filterByBranch = (m)=>{
      if(!selected || selected.size===0) return true;
      const bid = (m.branch_char||'').toString().toUpperCase();
      return selected.has(bid);
    };
    const rowsMembers = members.filter(filterByBranch);
    // 统计所有存在的世代
    const gens = Array.from(new Set(rowsMembers.map(m=>Number(m.generation)||0))).sort((a,b)=>a-b);
    // 逐世代渲染一行
    gens.forEach(gen=>{
      const row = document.createElement('div');
      row.className = 'row flex flex-col gap-1 py-2 border-t border-gray-100';
      row.dataset.generation = String(gen);
      // 行头：世代与折叠按钮
      const head = document.createElement('div');
      head.className = 'row-head flex items-center justify-between';
      const left = document.createElement('div');
      left.className = 'flex items-center gap-2';
      left.innerHTML = `<span class="no inline-flex items-center px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-200 text-xs">第 ${gen} 世</span>`;
      const right = document.createElement('div');
      right.className = 'flex items-center gap-2';
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'px-2 py-1 text-xs rounded border border-gray-200';
      toggleBtn.textContent = '收起';
      head.appendChild(left);
      head.appendChild(right);
      right.appendChild(toggleBtn);
      row.appendChild(head);
      const body = document.createElement('div');
      body.className = 'row-body flex flex-wrap gap-2 items-start';
      row.appendChild(body);
      // 当前世代成员，按出生时间升序排列（未知日期排后），同日按姓名字典序
      const list = rowsMembers.filter(m=>Number(m.generation)===gen).sort((a,b)=>{
        const ta = Date.parse((a.birth_date||'').trim());
        const tb = Date.parse((b.birth_date||'').trim());
        const aHas = !isNaN(ta);
        const bHas = !isNaN(tb);
        if(aHas && bHas){ if(ta!==tb) return ta - tb; }
        else if(aHas && !bHas){ return -1; }
        else if(!aHas && bHas){ return 1; }
        return (normalizeStr(a.name)).localeCompare(normalizeStr(b.name));
      });
      // 渲染节点卡片（仅显示男性成员；女性成员不显示；男性卡片增加子女信息）
      const displayList = list.filter(m=>{ const g = (normalizeStr(m.gender)||''); return !g.includes('女'); });
      displayList.forEach(m=>{
        const card = document.createElement('div');
        card.className = 'node inline-flex flex-col items-start bg-white border border-gray-200 rounded px-3 py-2 min-w-[180px] shadow-sm';
        card.dataset.uuid = m.member_uuid;
        // 标题：姓名 + 性别图标（仅男性显示卡片）
        const title = document.createElement('div');
        title.className = 'font-semibold text-gray-800 inline-flex items-center gap-1';
        const gender = (normalizeStr(m.gender)||'');
        if(gender){ const icon = document.createElement('i'); icon.className = 'fa fa-male text-blue-500'; title.appendChild(icon); }
        title.appendChild(document.createTextNode(normalizeStr(m.name)||m.member_uuid));
        // 元信息：字辈 / 世系 / 分支 / 生卒
        const meta = document.createElement('div');
        meta.className = 'text-xs text-gray-500';
        const branchId = (m.branch_char||'').toString().toUpperCase();
        const branchName = branchIdToName.get(branchId) || branchId;
        const bd = [normalizeStr(m.birth_date), normalizeStr(m.death_date)].filter(Boolean).join(' — ');
        meta.textContent = `第${m.generation||'?'}世 • ${m.zi||''} • ${branchName||''} ${bd?('• '+bd):''}`.replace(/\s+•\s+/g,' • ').trim();
        // 关系：父母与配偶（仅文本，不连线；连线由 drawLines 处理）
        const rel = document.createElement('div');
        rel.className = 'text-xs text-gray-600 mt-1';
        const father = m.father_id ? byUUID.get(m.father_id) : null;
        const mother = m.mother_id ? byUUID.get(m.mother_id) : null;
        const spouse = m.spouse_id ? byUUID.get(m.spouse_id) : null;
        rel.textContent = `父：${father?normalizeStr(father.name):'—'} 母：${mother?normalizeStr(mother.name):'—'} 配：${spouse?normalizeStr(spouse.name):'—'}`;
        // 子女信息：按出生时间排序，显示姓名与性别标记
        const kidsLine = document.createElement('div');
        kidsLine.className = 'text-xs text-gray-600 mt-1';
        // 包含父系与母系：若父id缺失但母id为配偶id，也视为当前男性的子女
         const children = members.filter(ch => ((ch.father_id||'') === m.member_uuid) || (m.spouse_id && ((ch.mother_id||'') === m.spouse_id)));
        if(children.length){
          const names = children
            .slice()
            .sort((a,b)=>{
              const ta = Date.parse((a.birth_date||'').trim());
              const tb = Date.parse((b.birth_date||'').trim());
              const aHas = !isNaN(ta); const bHas = !isNaN(tb);
              if(aHas && bHas){ if(ta!==tb) return ta - tb; }
              else if(aHas && !bHas){ return -1; }
              else if(!aHas && bHas){ return 1; }
              return (normalizeStr(a.name)).localeCompare(normalizeStr(b.name));
            })
            .map(ch=>{
              const gn = (normalizeStr(ch.gender)||'');
              // 使用性别符号标注：女=♀，男=♂，未知不显示
              const tag = gn.includes('女') ? '♀' : (gn.includes('男') ? '♂' : '');
              const nm = normalizeStr(ch.name)||ch.member_uuid;
              return tag ? `${tag} ${nm}` : nm;
            });
          kidsLine.textContent = `子女：${names.join('、')}`;
        } else {
          kidsLine.textContent = '子女：—';
        }
        // 装配
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(rel);
        card.appendChild(kidsLine);
        // 保存引用，便于高亮与连线
        byNode.set(m.member_uuid, card);
        // 点击成员卡片：弹出二级详情模态（复用宝塔图详情）
         if(!card.dataset.bound){
           card.dataset.bound='1';
           card.addEventListener('click', ()=>{ try{ showMemberDetail(m.member_uuid); }catch(e){} });
           // 悬停时仅显示与该成员相关的连线（当开启悬停模式）
           card.addEventListener('mouseenter', ()=>{ state.hoveredUuid = m.member_uuid; if(state.hoverOnlyLines){ try{ drawLines(); }catch(e){} } });
           card.addEventListener('mouseleave', ()=>{ state.hoveredUuid = ''; if(state.hoverOnlyLines){ try{ drawLines(); }catch(e){} } });
         }
         body.appendChild(card);
      });
      // 已移除“配偶男左女右”调整：女性成员卡片不显示，无需重新排布

      // 行折叠状态初始化与事件
      const isCollapsed = state.rowsCollapsedGens && state.rowsCollapsedGens.has(gen);
      if(isCollapsed){ body.classList.add('hidden'); toggleBtn.textContent = '展开'; }
      toggleBtn.addEventListener('click', ()=>{
        const coll = state.rowsCollapsedGens || new Set();
        if(body.classList.contains('hidden')){ body.classList.remove('hidden'); toggleBtn.textContent = '收起'; coll.delete(gen); }
        else { body.classList.add('hidden'); toggleBtn.textContent = '展开'; coll.add(gen); }
        state.rowsCollapsedGens = coll;
        // 重新绘制连线（仅可见节点）
        drawLines();
      });
      elTreeRows.appendChild(row);
    });
    // 绘制父/母-子连线（仅上一世）
    drawLines();
    // 绑定滚动节流重绘（仅绑定一次）
    if(elTreeContainer && !elTreeContainer.dataset.linesScrollBound){
      elTreeContainer.dataset.linesScrollBound = '1';
      let _linesScrollTimer = null;
      elTreeContainer.addEventListener('scroll', ()=>{
        if(_linesScrollTimer) return;
        _linesScrollTimer = setTimeout(()=>{ _linesScrollTimer = null; try{ drawLines(); }catch(e){} }, 120);
      });
    }
  }

  // 初始化与分区切换（按需渲染）
  function getInitialSection(){
    const hash = (location.hash||'').replace('#','');
    return ['family-info','members','tree','stories'].includes(hash) ? hash : 'family-info';
  }
  function showSection(id){
    ['family-info','members','tree','stories'].forEach(secId=>{
      const el = document.getElementById(secId);
      if(el){ el.style.display = (secId===id) ? '' : 'none'; }
    });
    // 激活导航样式
    document.querySelectorAll('.site-nav a').forEach(a=>{
      const href = a.getAttribute('href')||'';
      const target = href.startsWith('#') ? href.slice(1) : '';
      if(target===id){ a.classList.add('bg-gray-100'); } else { a.classList.remove('bg-gray-100'); }
    });
    // 懒加载内容
    if(id==='family-info'){
      renderFamilyInfo();
      renderManagementTeam();
      renderBranches();
      renderGenerations();
    } else if(id==='members'){
       setupFilters();
       // 绑定视图模式按钮与导出按钮（仅绑定一次）
       const updateViewModeToggle = ()=>{
          if(elViewModeBtnTable && elViewModeBtnCard){
            if(state.viewMode==='table'){
              elViewModeBtnTable.classList.add('bg-gray-100');
              elViewModeBtnCard.classList.remove('bg-gray-100');
            } else {
              elViewModeBtnCard.classList.add('bg-gray-100');
              elViewModeBtnTable.classList.remove('bg-gray-100');
            }
          }
        };
        if(elViewModeBtnTable && !elViewModeBtnTable.dataset.bound){ elViewModeBtnTable.dataset.bound='1'; elViewModeBtnTable.addEventListener('click', ()=>{ state.viewMode='table'; state.page=1; updateViewModeToggle(); renderMembers(); }); }
        if(elViewModeBtnCard && !elViewModeBtnCard.dataset.bound){ elViewModeBtnCard.dataset.bound='1'; elViewModeBtnCard.addEventListener('click', ()=>{ state.viewMode='card'; state.page=1; updateViewModeToggle(); renderMembers(); }); }
        if(elExportCsvBtn && !elExportCsvBtn.dataset.bound){ elExportCsvBtn.dataset.bound='1'; elExportCsvBtn.addEventListener('click', exportMembersCsv); }
        setupSorting();
        updateViewModeToggle();
        renderMembers();
     } else if(id==='tree'){
       // 读取并应用树视图模式：'bft'（宝塔图）或 'rows'（世代行）
       const savedTreeViewMode = (localStorage.getItem('treeViewMode')||'bft').toLowerCase();
       const applyTreeView = (mode)=>{
         const m = (mode||'bft').toLowerCase();
         localStorage.setItem('treeViewMode', m);
         if(m==='rows'){
           if(elBftContainer){ elBftContainer.style.display = 'none'; }
           if(elTreeContainer){ elTreeContainer.style.display = 'block'; }
           // 取消 hidden 类，显示 Rows 过滤/折叠工具条（已移至 treeContainer 内部）
  if(elRowsFiltersBar){ elRowsFiltersBar.classList.remove('hidden'); setupRowsFilters(); }
  // 确保容器可见
  if(elTreeContainer) elTreeContainer.classList.remove('hidden');
           // 使用自定义“按世代行”布局渲染
           renderTreeRowsLayout();
         } else {
           if(elTreeContainer){ elTreeContainer.style.display = 'none'; }
           if(elBftContainer){ elBftContainer.style.display = 'block'; }
           // 添加 hidden 类，隐藏 Rows 过滤/折叠工具条
           if(elRowsFiltersBar){ elRowsFiltersBar.classList.add('hidden'); }
           // 使用 Balkan FamilyTreeJS（FREE）渲染“宝塔图”视图，支持手机与PC响应式
           renderTree();
         }
       };
       applyTreeView(savedTreeViewMode);
       // 绑定视图切换按钮（仅绑定一次）
       const btnBft = document.getElementById('bftViewModeBtn');
       const btnRows = document.getElementById('rowsViewModeBtn');
       const updateBtnUI = ()=>{
         if(btnBft && btnRows){
           const current = (localStorage.getItem('treeViewMode')||'bft').toLowerCase();
           if(current==='rows'){
             btnRows.classList.add('bg-gray-100');
             btnBft.classList.remove('bg-gray-100');
           } else {
             btnBft.classList.add('bg-gray-100');
             btnRows.classList.remove('bg-gray-100');
           }
         }
       };
       if(btnBft && !btnBft.dataset.bound){ btnBft.dataset.bound='1'; btnBft.addEventListener('click', ()=>{ applyTreeView('bft'); updateBtnUI(); }); }
        if(btnRows && !btnRows.dataset.bound){ btnRows.dataset.bound='1'; btnRows.addEventListener('click', ()=>{ applyTreeView('rows'); updateBtnUI(); }); }
        updateBtnUI();
        // 已移除响应式模式按钮（手机优化/桌面优化/自动）。
        // 保留渲染逻辑：renderTree 将根据内部判断或本地存储的 bftResponsiveMode 进行布局，无需绑定任何按钮事件。

      }
     else if(id==='stories'){
       renderStories();
     }
  }

// 家族故事：使用 Hexo 生成页面（移除旧版 JSON 渲染函数）
function renderStories(){
  var sec = document.getElementById('stories');
  if(!sec) return;
  // 仅使用 Hexo 生成的 HTML，完全由 Hexo 管理家族故事内容
  var mount = document.getElementById('hexoMount') || sec;
  // 加载中占位（Skeleton）
  var skeleton = document.getElementById('storiesSkeleton');
  if(!skeleton){
    skeleton = document.createElement('div');
    skeleton.id = 'storiesSkeleton';
    skeleton.className = 'flex items-center gap-2 text-gray-500 mt-2';
    skeleton.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>正在加载家族故事…</span>';
    mount.appendChild(skeleton);
  }
  var hexoFrame = document.getElementById('storiesHtmlFrame');
  if(!hexoFrame){
    hexoFrame = document.createElement('iframe');
    hexoFrame.id = 'storiesHtmlFrame';
    hexoFrame.src = 'hexo_site/public/index.html';
    hexoFrame.className = 'w-full border rounded-xl';
    hexoFrame.loading = 'lazy';
    hexoFrame.style.width = '100%';
    // 视口自适应高度（移动端兜底最小高度）
    var setFrameHeight = function(){
      try{
        var rect = mount.getBoundingClientRect();
        var vh = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
        var available = vh - rect.top - 60; // 预留底部空间
        hexoFrame.style.height = Math.max(available, 420) + 'px';
      }catch(e){
        hexoFrame.style.height = '720px';
      }
    };
    setFrameHeight();
    window.addEventListener('resize', setFrameHeight);
    hexoFrame.addEventListener('load', function(){
      if(skeleton && skeleton.parentNode){ skeleton.parentNode.removeChild(skeleton); }
    });
    mount.appendChild(hexoFrame);
  }
}

  function init(){
    if (window.__BFT_APP_INIT_DONE) return; window.__BFT_APP_INIT_DONE = true;
    showSection(getInitialSection());
    // 深链打开成员详情（避免覆盖树视图）
    try{
      const url = new URL(window.location.href);
      const linkUuid = url.searchParams.get('member') || (location.hash.startsWith('#member=') ? location.hash.split('=')[1] : '');
      const linkName = url.searchParams.get('memberName');
      const currentSection = getInitialSection();
      if(currentSection !== 'tree'){
        if(linkUuid && byUUID.has(linkUuid)){
          location.hash = '#members';
          showSection('members');
          showMemberDetail(linkUuid);
        } else if(linkName){
          const m = members.find(x => (x.name||'').trim() === (linkName||'').trim());
          if(m){
            location.hash = '#members';
            showSection('members');
            showMemberDetail(m.member_uuid);
          }
        }
      }
    }catch(e){}
    // 监听 hash 切换
    window.addEventListener('hashchange', ()=>{ showSection(getInitialSection()); });
    // 返回顶部按钮
    const backBtn = document.getElementById('backToTop');
    if(backBtn){
      const toggle = ()=>{ backBtn.style.display = window.scrollY>200 ? 'inline-flex' : 'none'; };
      window.addEventListener('scroll', toggle);
      toggle();
      backBtn.addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'}));
    }
  }

  function highlightMember(uuid, doScroll){
    document.querySelectorAll('.card.highlight').forEach(el=>el.classList.remove('highlight','ring-2','ring-blue-500'));
    document.querySelectorAll('.node.active').forEach(el=>el.classList.remove('active','ring-2','ring-green-500'));
    const card = byCard.get(uuid);
    const node = byNode.get(uuid);
    if(card){ card.classList.add('highlight','ring-2','ring-blue-500'); if(doScroll) card.scrollIntoView({behavior:'smooth', block:'center'}); }
    if(node){ node.classList.add('active','ring-2','ring-green-500'); node.scrollIntoView({behavior:'smooth', block:'center'}); }
  }

  function showMemberDetail(uuid){
    const m = byUUID.get(uuid);
    if(!m) return;
    const father = m.father_id ? byUUID.get(m.father_id) : null;
    const mother = m.mother_id ? byUUID.get(m.mother_id) : null;
    const spouse = m.spouse_id ? byUUID.get(m.spouse_id) : null;
    const children = Array.isArray(m.child_id) ? m.child_id.map(id=>byUUID.get(id)).filter(Boolean) : [];
   const fatherHtml = father ? `<a href="#member=${father.member_uuid}" data-uuid="${father.member_uuid}" class="inline-flex items-center gap-1 text-blue-600 hover:underline"><i class="fa fa-male"></i>${normalizeStr(father.name)}</a>` : '—';
   const motherHtml = mother ? `<a href="#member=${mother.member_uuid}" data-uuid="${mother.member_uuid}" class="inline-flex items-center gap-1 text-blue-600 hover:underline"><i class="fa fa-female"></i>${normalizeStr(mother.name)}</a>` : '—';
   const spouseHtml = spouse ? `<a href="#member=${spouse.member_uuid}" data-uuid="${spouse.member_uuid}" class="inline-flex items-center gap-1 text-blue-600 hover:underline"><i class="fa fa-heart"></i>${normalizeStr(spouse.name)}</a>` : '—';
   const childrenHtml = children.length ? children.map(c=>`<a href="#member=${c.member_uuid}" data-uuid="${c.member_uuid}" class="inline-flex items-center gap-1 text-blue-600 hover:underline"><i class="fa fa-child"></i>${normalizeStr(c.name)}</a>`).join('，') : '—';
     const metaParts = [];
     const _gender = normalizeStr(m.gender);
     if(_gender) metaParts.push(_gender);
     const _occupation = normalizeStr(m.occupation);
     if(_occupation) metaParts.push(_occupation);
     metaParts.push(`第${m.generation||'?'}世`);
     // 年龄信息加入 meta
     const ageText = (()=>{
       const bdStr = normalizeStr(m.birth_date);
       const ddStr = normalizeStr(m.death_date);
       if(!bdStr) return '';
       const bd = new Date(bdStr);
       if(isNaN(bd.getTime())) return '';
       const ref = ddStr ? new Date(ddStr) : new Date();
       if(isNaN(ref.getTime())) return '';
       let age = ref.getFullYear() - bd.getFullYear();
       const mo = ref.getMonth() - bd.getMonth();
       if(mo < 0 || (mo === 0 && ref.getDate() < bd.getDate())) age--;
       const prefix = ddStr ? '享年' : '现年';
       return `${prefix}${age}岁`;
     })();
     if(ageText) metaParts.push(ageText);
     const metaHtml = metaParts.length ? `<div class="text-gray-500 text-sm">${metaParts.join(' · ')}</div>` : '';
     const _bio = normalizeStr(m.bio);
      const maxBioLen = bioMaxLen;
      const isLongBio = !!_bio && _bio.length > maxBioLen;
      const _bioShort = isLongBio ? (_bio.slice(0, maxBioLen) + '…') : _bio;
     const bioHtml = _bio ? `<p class=\"mt-2 mb-0 whitespace-pre-line text-gray-700\"><span class=\"bio-text\">${_bioShort}</span>${isLongBio?` <button type=\"button\" class=\"bio-toggle text-blue-600 text-xs ml-2\">展开</button>`:''}</p>` : '';
     const html = `
       <h3 class="mt-0 text-lg font-semibold">${normalizeStr(m.name)||m.member_uuid}</h3>
       ${metaHtml}
       <div class="mt-3 space-y-1">
        <div>父亲：${fatherHtml}</div>
        <div>母亲：${motherHtml}</div>
        <div>配偶：${spouseHtml}</div>
        <div>子女：${childrenHtml}</div>
       </div>
       ${bioHtml}
     `;
     const modal = document.getElementById('detailModal');
     const content = document.getElementById('detailContent');
     const closeBtn = document.getElementById('modalClose');
     if(modal && content){ content.innerHTML = html; modal.classList.remove('hidden'); }
     // 在模态框中为简介折叠/展开按钮绑定事件（考虑文字过长的折叠情况）
     if(content){
       const toggle = content.querySelector('.bio-toggle');
       const textEl = content.querySelector('.bio-text');
       if(toggle && textEl){
         let expanded = false;
         toggle.addEventListener('click', ()=>{
           expanded = !expanded;
           toggle.textContent = expanded ? '收起' : '展开';
           textEl.textContent = expanded ? _bio : _bioShort;
         });
       }
     }
     if(closeBtn){ closeBtn.onclick = ()=>modal.classList.add('hidden'); }
     const backdrop = modal ? modal.querySelector('.modal-backdrop') : null;
     if(backdrop){ backdrop.onclick = ()=>modal.classList.add('hidden'); }
    if(content){ content.querySelectorAll('a[data-uuid]').forEach(a=>{ a.addEventListener('click',(ev)=>{ ev.preventDefault(); const uid=a.dataset.uuid; if(uid) showMemberDetail(uid); }); }); }
     // 更新 URL 参数以支持深链
     try{
       const url = new URL(window.location.href);
       url.searchParams.set('member', uuid);
       history.replaceState(null, '', url.toString());
     }catch(e){}
     highlightMember(uuid, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 调试：监听容器的滚轮与指针事件，确认事件是否到达容器/库
(function attachBftDebugListeners(){
  const el = document.querySelector('#bftContainer');
  if(!el) return;
  const log = (msg, evt)=>{
    try{ console.log(`[BFT-Debug] ${msg}`, {type: evt.type, deltaX: evt.deltaX, deltaY: evt.deltaY, buttons: evt.buttons}); }catch(_){ /* noop */ }
  };
  el.addEventListener('wheel', (e)=>{ log('wheel', e); });
  el.addEventListener('pointerdown', (e)=>{ log('pointerdown', e); });
  el.addEventListener('pointermove', (e)=>{ if(e.buttons) log('pointermove', e); });
  el.addEventListener('pointerup', (e)=>{ log('pointerup', e); });
})();


function attachBftDiagnostics(){
  try{
    if(window.__bftDiagnosticsBound){ return; }
    window.__bftDiagnosticsBound = '1';

    const container = document.getElementById('bftContainer');
    const inner = document.getElementById('bftInner');
    let svg = null;
    try{ svg = bftInstance && bftInstance.getSvg && bftInstance.getSvg(); }catch(e){ svg = null; }
    if(!svg && container){ svg = container.querySelector('svg'); }

    const getClassName = (el)=>{
      if(!el) return '';
      const cn = el.className;
      if(!cn) return '';
      if(typeof cn === 'string') return cn;
      return cn.baseVal || '';
    };
    const tagIdClass = (el)=>{
      if(!el) return 'null';
      const id = el.id || '';
      const cls = getClassName(el);
      return `${(el.tagName||'').toLowerCase()}${id?('#'+id):''}${cls?('.'+cls.replace(/\s+/g,'.')):''}`;
    };
    const summarizePath = (evt)=>{
      try{
        const path = (evt.composedPath && evt.composedPath()) || evt.path || [];
        return path.slice(0,6).map(tagIdClass);
      }catch(e){ return []; }
    };
    const diag = (scope, evt)=>{
      try{
        const tgt = evt.target;
        const record = {
          ts: Date.now(),
          scope,
          type: evt.type,
          pointerType: evt.pointerType,
          pointerId: evt.pointerId,
          button: evt.button,
          buttons: evt.buttons,
          ctrlKey: !!evt.ctrlKey,
          shiftKey: !!evt.shiftKey,
          altKey: !!evt.altKey,
          metaKey: !!evt.metaKey,
          deltaY: (typeof evt.deltaY==='number'?evt.deltaY:undefined),
          target: tagIdClass(tgt),
          currentTarget: tagIdClass(evt.currentTarget),
          defaultPrevented: !!evt.defaultPrevented,
          composed: !!evt.composed,
          path: summarizePath(evt)
        };
        try{
          window.__bftDiagEvents = window.__bftDiagEvents || [];
          window.__bftDiagEvents.push(record);
          if(window.__bftDiagEvents.length > 300){ window.__bftDiagEvents.splice(0, window.__bftDiagEvents.length - 300); }
        }catch(_e){}
        const s = `[BFT-Diag] ${record.scope}:${record.type} ptr=${record.pointerType||''} btn=${record.button} buttons=${record.buttons} wheel=${typeof record.deltaY==='number'?record.deltaY:0} tgt=${record.target} cur=${record.currentTarget} prevented=${record.defaultPrevented} keys=${record.ctrlKey?'C':''}${record.shiftKey?'S':''}${record.altKey?'A':''}${record.metaKey?'M':''} path=${(record.path||[]).join('>')}`;
        console.log(s);
      }catch(e){ console.log('[BFT-Diag] log-error', e); }
    };
    const bind = (el, scope)=>{
      if(!el) return;
      const types = ['pointerdown','pointermove','pointerup','click','mousedown','mousemove','mouseup','wheel'];
      types.forEach(tp=>{
        const opts = tp==='wheel' ? {capture:true, passive:false} : {capture:true};
        el.addEventListener(tp, (evt)=> diag(scope, evt), opts);
      });
    };

    // 初始状态快照
    try{
      const contRect = container ? container.getBoundingClientRect() : null;
      const svgRect = svg ? svg.getBoundingClientRect() : null;
      const contPE = container ? getComputedStyle(container).pointerEvents : undefined;
      const svgPE = svg ? getComputedStyle(svg).pointerEvents : undefined;
      console.log('[BFT-Diag] init', { contRect, svgRect, contPE, svgPE, hasSvg: !!svg });
    }catch(e){}

    bind(container, 'container');
    bind(inner, 'inner');
    bind(svg, 'svg');

    // 文档级捕获，观察是否被阻止或冒泡到全局
    try{
      document.addEventListener('click', (evt)=> diag('document', evt), true);
      document.addEventListener('wheel', (evt)=> diag('document', evt), {capture:true, passive:false});
      document.addEventListener('pointerdown', (evt)=> diag('document', evt), true);
      document.addEventListener('mousedown', (evt)=> diag('document', evt), true);
      document.addEventListener('mouseup', (evt)=> diag('document', evt), true);
    }catch(e){}

    // 自动交互注入：仅在 bftdiag=2 时运行一次
    try{
      if (String(location.search || '').includes('bftdiag=2') && !window.__bftAutoInteractOnce) {
        window.__bftAutoInteractOnce = '1';
        setTimeout(()=>{
          try{
            const target = svg || inner || container || document.querySelector('svg');
            if(target){
              const rect = target.getBoundingClientRect();
              const cx = Math.floor(rect.left + rect.width/2);
              const cy = Math.floor(rect.top + rect.height/2);
              // wheel
              target.dispatchEvent(new WheelEvent('wheel', {bubbles:true, cancelable:true, clientX:cx, clientY:cy, deltaY:180}));
              // click
              target.dispatchEvent(new MouseEvent('mousedown', {bubbles:true, cancelable:true, clientX:cx, clientY:cy, button:0, buttons:1}));
              target.dispatchEvent(new MouseEvent('mouseup', {bubbles:true, cancelable:true, clientX:cx, clientY:cy, button:0, buttons:0}));
              target.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, clientX:cx, clientY:cy, button:0}));
              // drag (pointerdown -> move -> up)
              target.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, cancelable:true, clientX:cx, clientY:cy, pointerId:1, pointerType:'mouse', buttons:1}));
              target.dispatchEvent(new PointerEvent('pointermove', {bubbles:true, cancelable:true, clientX:cx+20, clientY:cy+10, pointerId:1, pointerType:'mouse', buttons:1}));
              target.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, cancelable:true, clientX:cx+20, clientY:cy+10, pointerId:1, pointerType:'mouse', buttons:0}));
              console.log('[BFT-Auto] auto interactions dispatched');
            }else{
              console.log('[BFT-Auto] no target element found for auto interactions');
            }
          }catch(e){ console.log('[BFT-Auto] dispatch-error', e); }
        }, 300);
      }
    }catch(e){ console.log('[BFT-Auto] setup-error', e); }

  }catch(e){ console.log('[BFT-Diag] attach-error', e); }
}

function attachBftViewportInteractions(){
  const container = document.getElementById('bftContainer');
  const inner = document.getElementById('bftInner');
  if(!container || !inner || container.dataset.viewportBound) return;
  container.dataset.viewportBound = '1';
  // 即使找不到 getViewBox，也先绑定滚轮阻止页面滚动，避免右侧滚动条移动
  const clamp = (v, min, max)=> Math.min(max, Math.max(min, v));
  let currentScale = 1;
  try{ const bi = window.bftInstance; if(bi && bi.getScale) currentScale = bi.getScale(); }catch(e){ currentScale = 1; }
  // 移除旧的 CSS 变换，改用 FamilyTree 的视口与缩放，保证 SVG 文本清晰
  inner.style.transform = '';

  // 阻止滚轮导致页面滚动：在容器与内层上捕获 wheel 并 preventDefault，保留事件给 FamilyTree 缩放处理
  try{
    container.style.overscrollBehavior = 'contain';
    inner.style.overscrollBehavior = 'contain';
  }catch(e){}
  // 标记是否启用回退缩放/平移，实现与库的事件隔离
  let fallbackActive = false;
  const stopPageScrollWheel = (evt)=>{
    // 仅阻止默认滚动，让事件继续传播到 SVG 层进行缩放处理
    try{ evt.preventDefault(); }catch(e){}
  };
  try{
    container.addEventListener('wheel', stopPageScrollWheel, {capture:true, passive:false});
    inner.addEventListener('wheel', stopPageScrollWheel, {capture:true, passive:false});
  }catch(e){}

  // Diagnostics logging control via URL/Config
(function(){
  try{
    const params = new URLSearchParams(window.location.search);
    const cfg = window.BFT_CONFIG || {};
    const urlLog = params.get('bftlog');
    const urlDiag = params.get('bftdiag');
    const enabled = cfg.logEnabled ?? cfg.log ?? ((urlLog !== null && urlLog !== '0') || (urlDiag !== null && urlDiag !== '0'));
    const levelParam = (urlLog !== null ? urlLog : urlDiag);
    const level = typeof cfg.logLevel === 'number' ? cfg.logLevel : (levelParam && !isNaN(+levelParam) ? +levelParam : (enabled ? 1 : 0));
    const logFn = function(l, ...args){ if(enabled && l <= level){ try{ console.log(...args); }catch(_){ } } };
    const errFn = function(...args){ try{ console.error(...args); }catch(_){ } };
    window.BFT_LOG = {log: logFn, error: errFn, enabled, level};
  }catch(_){}
})();

// Fallback 视口缩放/平移：当库未提供 setViewBox/setScale 等方法时，直接操作 SVG viewBox
  try{
    const svg = inner.querySelector('svg') || document.querySelector('#bftInner svg') || document.querySelector('svg');
    const bi = window.bftInstance;
    const needFallback = !bi || (!(bi.setViewBox) && !(bi.setScale));
    if(svg && needFallback){
      fallbackActive = true;
      try{ window.__bftFallbackActive = true; }catch(_){}
      const getVB = ()=>{
        const vbObj = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
        if(vbObj) return { x: vbObj.x, y: vbObj.y, w: vbObj.width, h: vbObj.height };
        const vbStr = String(svg.getAttribute('viewBox')||'').trim();
        if(vbStr){ const [x,y,w,h] = vbStr.split(/\s+/).map(Number); return { x, y, w, h }; }
        const rect = svg.getBoundingClientRect();
        return { x: 0, y: 0, w: rect.width || 1000, h: rect.height || 1000 };
      };
      const setVB = (vb)=>{
        const x = vb.x, y = vb.y, w = Math.max(10, vb.w), h = Math.max(10, vb.h);
        svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
      };
      const toSvgPoint = (clientX, clientY)=>{
        let pt = svg.createSVGPoint ? svg.createSVGPoint() : { x: clientX, y: clientY, matrixTransform: (m)=>({x:clientX, y:clientY}) };
        pt.x = clientX; pt.y = clientY;
        try{
          const m = svg.getScreenCTM();
          if(m && m.inverse) return pt.matrixTransform(m.inverse());
        }catch(e){}
        // 回退：无法转换时，按当前 viewBox 与屏幕坐标近似映射
        const vb = getVB(); const rect = svg.getBoundingClientRect();
        const sx = (clientX - rect.left) / rect.width; const sy = (clientY - rect.top) / rect.height;
        return { x: vb.x + vb.w * sx, y: vb.y + vb.h * sy };
      };
      // 拖拽平移（使用屏幕坐标差映射到 viewBox，避免因动态变换导致的抖动）
      let dragging = false, dragStartClient = null, vbStart = null, dragScale = {x:1, y:1};
      svg.addEventListener('pointerdown', (evt)=>{
        if(evt.button !== 0) return;
        dragging = true; vbStart = getVB(); dragStartClient = {x:evt.clientX, y:evt.clientY};
        const rect = svg.getBoundingClientRect();
        const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
        dragScale = { x: vbStart.w / w, y: vbStart.h / h };
        try{ if(svg.setPointerCapture) svg.setPointerCapture(evt.pointerId); }catch(e){}
        try{ evt.preventDefault(); }catch(e){}
        // 不在 pointerdown 阶段阻止传播，保留节点点击等交互；在拖拽移动阶段再阻止
      }, {capture:true});
      svg.addEventListener('pointermove', (evt)=>{
        if(!dragging || !dragStartClient || !vbStart) return;
        const dx = (evt.clientX - dragStartClient.x) * dragScale.x;
        const dy = (evt.clientY - dragStartClient.y) * dragScale.y;
        setVB({ x: vbStart.x - dx, y: vbStart.y - dy, w: vbStart.w, h: vbStart.h });
        try{ evt.preventDefault(); }catch(e){}
        try{ evt.stopPropagation(); }catch(e){}
        try{ evt.stopImmediatePropagation(); }catch(e){}
      }, {capture:true});
      svg.addEventListener('pointerup', (evt)=>{ dragging = false; dragStartClient = null; vbStart = null; try{ if(svg.releasePointerCapture) svg.releasePointerCapture(evt.pointerId); }catch(e){} }, {capture:true});
      svg.addEventListener('pointerleave', (evt)=>{ dragging = false; dragStartClient = null; vbStart = null; try{ if(svg.releasePointerCapture) svg.releasePointerCapture(evt.pointerId); }catch(e){} }, {capture:true});
      // 滚轮缩放（围绕光标点）
      svg.addEventListener('wheel', (evt)=>{
        const vb = getVB(); const pt = toSvgPoint(evt.clientX, evt.clientY);
        const factor = evt.deltaY > 0 ? 1.1 : 0.9;
        const newW = clamp(vb.w * factor, 10, 1000000); const newH = clamp(vb.h * factor, 10, 1000000);
        const rx = (pt.x - vb.x) / vb.w; const ry = (pt.y - vb.y) / vb.h;
        const newX = pt.x - rx * newW; const newY = pt.y - ry * newH;
        setVB({ x: newX, y: newY, w: newW, h: newH });
        try{ evt.preventDefault(); }catch(e){}
        try{ evt.stopPropagation(); }catch(e){}
        try{ evt.stopImmediatePropagation(); }catch(e){}
        // removed debug log: [BFT-Fallback] wheel
      }, {capture:true, passive:false});
      // fallback pan/zoom enabled
    }
  }catch(e){ if(window.BFT_LOG){ try{ BFT_LOG.error('[BFT-Viewport] fallback error', e); }catch(_){ } } }

}
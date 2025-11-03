const fs = require('fs');
const path = require('path');

// Absolute paths
const ROOT = path.resolve('..');
const STORIES_JSON = path.join(ROOT, 'Data', 'stories.json');
const POSTS_DIR = path.join(process.cwd(), 'source', '_posts');

function ensureDir(p){ if(!fs.existsSync(p)){ fs.mkdirSync(p, { recursive: true }); } }
function slugify(input, fallback){
  let s = String(input || '').trim().toLowerCase();
  // replace spaces with hyphen
  s = s.replace(/\s+/g, '-');
  // keep a-z0-9-hyphen only; convert other unicode to hyphen
  s = s.replace(/[^a-z0-9-]+/g, '-');
  // collapse multiple hyphens
  s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');
  if(!s){ s = String(fallback || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
  if(!s){ s = 'story-' + Date.now(); }
  return s;
}

function buildFrontMatter(story){
  const lines = [];
  lines.push('---');
  lines.push(`title: ${story.title || '未命名故事'}`);
  if(story.subtitle){ lines.push(`subtitle: ${story.subtitle}`); }
  if(story.date){ lines.push(`date: ${story.date}`); }
  lines.push('categories:');
  lines.push('  - 家族故事');
  if(story.author){ lines.push(`author: ${story.author}`); }
  if(story.summary){ lines.push(`summary: ${story.summary.replace(/\n/g, ' ')}`); }
  if(Array.isArray(story.tags)){
    lines.push('tags:');
    story.tags.forEach(t=>{ lines.push(`  - ${t}`); });
  } else {
    lines.push('tags: []');
  }
  lines.push('---');
  return lines.join('\n');
}

function buildBody(story){
  // Prefer contentMd; fallback to summary
  const md = story.contentMd || (story.summary ? `> ${story.summary}` : '');
  const parts = [];
  if(md){ parts.push(md); }
  return parts.join('\n\n');
}

function main(){
  ensureDir(POSTS_DIR);
  if(!fs.existsSync(STORIES_JSON)){
    console.error('stories.json not found:', STORIES_JSON);
    process.exit(1);
  }
  const raw = fs.readFileSync(STORIES_JSON, 'utf8');
  let data;
  try{
    data = JSON.parse(raw);
  }catch(e){
    console.error('Failed to parse JSON:', e.message);
    process.exit(1);
  }
  const stories = Array.isArray(data) ? data : (data && Array.isArray(data.stories) ? data.stories : []);
  if(!stories.length){
    console.log('No stories to migrate.');
    return;
  }
  const outputs = [];
  stories.forEach((s, idx)=>{
    const slug = slugify(s.id || s.slug || s.title || ('story-' + (idx+1)), 'story-'+(idx+1));
    const fm = buildFrontMatter(s);
    const body = buildBody(s);
    const content = `${fm}\n\n${body}\n`;
    const outPath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(outPath, content, 'utf8');
    outputs.push({ slug, outPath });
  });
  console.log('Migrated stories:', outputs.map(o=>o.outPath));
  console.log('Public URLs will be under /hexo_site/public/posts/<slug>.html');
}

if(require.main === module){
  main();
}
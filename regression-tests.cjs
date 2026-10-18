// Real VibeFlow state and import/export functions, with in-memory storage only.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const input = process.argv[2] || path.join(__dirname, 'index.html');
const shell = fs.readFileSync(input, 'utf8');
const encoded = shell.match(/const WORKFLOW_HTML_BASE64\s*=\s*'([^']+)'/)[1];
const html = Buffer.from(encoded, 'base64').toString('utf8');
function between(start, end) {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  assert(a >= 0 && b > a, `source seam missing: ${start}`);
  return html.slice(a, b);
}
function setup(storage = new Map()) {
  const elements = new Map(), timers = new Map(), downloads = [];
  let timerId = 0;
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: '', innerText: '', dataset: {}, style: {}, click() {}, classList: { add() {}, remove() {}, toggle() {} } });
    return elements.get(id);
  };
  const ctx = {
    console, Date, Math, JSON, Promise, structuredClone, TextEncoder, TextDecoder,
    btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary'),
    encodeURIComponent, decodeURIComponent,
    document: { getElementById: element, createElement: () => ({ click() {} }), querySelectorAll: () => [] },
    localStorage: { getItem: key => storage.get(key) || null, setItem(key, value) { storage.set(key, value); } }, window: { innerWidth: 1440 },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame() {}, viewport: { offsetWidth: 1000, offsetHeight: 700 },
    Blob: class { constructor(parts) { this.text = parts.join(''); downloads.push(this.text); } },
    URL: { createObjectURL() { return 'memory:fixture'; }, revokeObjectURL() {} },
    confirm: () => true, alert() {},
    renderNodes() {}, drawConnections() {}, updateTransform() {}, toggleSidebar() {}, showToast() {}, resetTransientUiState() {}, clearNodeCopiedState() {},
    IDBAdapter: class {
      constructor() { this.rows = new Map(); }
      async getAll() { return [...this.rows.values()].map(x => structuredClone(x)); }
      async save(item) { this.rows.set(item.id, structuredClone(item)); }
      async delete(id) { this.rows.delete(id); }
    }
  };
  vm.createContext(ctx);
  vm.runInContext('let workflowData=[]; const state={panX:0,panY:0,scale:1};' +
    between('class JSONValidator {', '    const jsonValidator = new JSONValidator();') + 'const jsonValidator=new JSONValidator();' +
    between('class HistoryManager {', '    const historyManager = new HistoryManager();') + 'const historyManager=new HistoryManager();' +
    between('class AppStore {', '    const app = new AppStore();') + 'const app=new AppStore();' +
    between('function createNewNode() {', '    function addNextNode(') +
    between('function exportJSON() {', '    // JSON 文件导入') +
    between('function parseMarkdown(md) {', '    function importFromMarkdown() {') +
    between('function exportToMarkdown() {', '    function copyMarkdown() {') +
    'app.renderProjectList=()=>{};app.updateStorageMeter=()=>{};', ctx);
  if (html.includes('function escapeWorkflowHtml')) vm.runInContext(between('function escapeWorkflowHtml', '    function renderNodes'), ctx);
  return { ctx, downloads, timers, storage, run: code => vm.runInContext(code, ctx) };
}
const node = (id, next = []) => ({ id, x: 10, y: 20, title: id.toUpperCase(), status: 'todo', context: 'old', prompt: 'prompt', tot_evaluation: 'evaluation', next });
const results = [];
async function test(name, fn) {
  try { await fn(); results.push({ name, pass: true }); }
  catch (e) { results.push({ name, pass: false, error: e.message }); }
}
(async () => {
  await test('Edit then immediately export JSON contains current text', async () => {
    const h = setup(); h.ctx.seed = [node('a')];
    h.run('app.projects=[{id:"p",title:"P",nodes:seed}];app.loadProject("p");workflowData[0].context="latest";app.requestSave();');
    await h.run('exportJSON()');
    assert.equal(JSON.parse(h.downloads.at(-1)).nodes[0].context, 'latest');
  });
  await test('Switching projects before the save timer preserves edits', async () => {
    const h = setup(); h.ctx.seed = [node('a')];
    await h.run('(async()=>{await app.db.save({id:"p",title:"P",nodes:seed});await app.db.save({id:"q",title:"Q",nodes:seed});await app.refreshList();app.loadProject("p");workflowData[0].context="edited-before-switch";app.requestSave();app.loadProject("q");})()');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.run('app.db.rows.get("p").nodes[0].context'), 'edited-before-switch');
  });
  await test('Create node then undo and redo restores both states', async () => {
    const h = setup(); h.ctx.seed = [node('a')];
    h.run('app.projects=[{id:"p",title:"P",nodes:seed}];app.loadProject("p");createNewNode();');
    assert.equal(h.run('workflowData.length'), 2);
    h.run('historyManager.undo()'); assert.equal(h.run('workflowData.length'), 1);
    h.run('historyManager.redo()'); assert.equal(h.run('workflowData.length'), 2);
  });
  await test('Markdown roundtrip preserves branching and disconnected nodes', async () => {
    const h = setup(); h.ctx.seed = [node('a', ['c']), node('b'), node('c')];
    h.run('workflowData=seed;app.currentProject={id:"p",title:"P",nodes:seed};exportToMarkdown();');
    const nodes = h.run('parseMarkdown(document.getElementById("markdown-editor").value)');
    assert.equal(nodes.find(n => n.id === nodes[0].next[0]).title, 'C');
    assert.equal(nodes[1].next.length, 0);
  });
  await test('Legacy plain Markdown remains importable', async () => {
    const h = setup(); h.ctx.md = '## First [TODO]\n### CONTEXT\nlegacy\n### NEXT PROMPT\nhello\n---\n## Second [TODO]\n### CONTEXT\nsecond\n### NEXT PROMPT\nworld';
    const nodes = h.run('parseMarkdown(md)'); assert.equal(nodes.length, 2); assert.equal(nodes[0].next[0], nodes[1].id);
  });
  if (html.includes('snapshotCurrentProject')) {
    await test('Interrupted debounce has a valid synchronous recovery record', async () => {
      const h = setup(); h.ctx.seed = [node('a')];
      h.run('app.projects=[{id:"p",title:"P",nodes:seed}];app.loadProject("p");workflowData[0].context="unsaved recovery";app.requestSave();');
      const recovery = JSON.parse(h.storage.get('vibeflow_v34_workflow_recovery'));
      assert.equal(recovery.p.nodes[0].context, 'unsaved recovery');
      const restored = setup(h.storage);
      await restored.run('app.restoreRecoverySnapshots()');
      assert.equal(restored.run('app.db.rows.get("p").nodes[0].context'), 'unsaved recovery');
      assert.deepEqual(JSON.parse(h.storage.get('vibeflow_v34_workflow_recovery')), {});
    });
    await test('Failed storage commit prevents project switch and preserves edits', async () => {
      const h = setup(); h.ctx.seed = [node('a')]; h.ctx.console = { ...console, error() {} };
      h.run('app.projects=[{id:"p",title:"P",nodes:seed},{id:"q",title:"Q",nodes:seed}];app.loadProject("p");workflowData[0].context="keep this";app.requestSave();app.db.save=async()=>{throw Error("simulated commit abort")};');
      assert.equal(await h.run('app.loadProject("q")'), false);
      assert.equal(h.run('app.currentProject.id'), 'p');
      assert.equal(h.run('workflowData[0].context'), 'keep this');
    });
    await test('JSON export preserves metadata, view and disconnected branches', async () => {
      const h = setup(); h.ctx.seed = [node('a', ['c']), node('b'), node('c')];
      h.run('app.projects=[{id:"p",title:"P",nodes:seed,__mergedPromptLink:{convId:"public-example"}}];app.loadProject("p");state.panX=125;state.scale=0.75;');
      await h.run('exportJSON()'); const value = JSON.parse(h.downloads.at(-1));
      assert.equal(value.panX, 125); assert.equal(value.scale, 0.75); assert.equal(value.__mergedPromptLink.convId, 'public-example');
      assert.deepEqual(value.nodes[0].next, ['c']); assert.deepEqual(value.nodes[1].next, []);
    });
    await test('Unicode Markdown IDs and extra node fields survive roundtrip', async () => {
      const h = setup(); h.ctx.seed = [node('开始🙂', ['终点']), node('终点')];
      h.run('workflowData=seed;app.currentProject={id:"p",title:"P",nodes:seed};exportToMarkdown();');
      const value = h.run('parseMarkdown(document.getElementById("markdown-editor").value)');
      assert.equal(value[0].id, '开始🙂'); assert.equal(value[0].next[0], '终点'); assert.equal(value[0].tot_evaluation, 'evaluation');
    });
    await test('Corrupt Markdown topology is rejected instead of silently rewired', async () => {
      const h = setup(); h.ctx.seed = [node('a')];
      h.run('workflowData=seed;app.currentProject={id:"p",title:"P",nodes:seed};exportToMarkdown();');
      let md = h.run('document.getElementById("markdown-editor").value');
      const payload = Buffer.from(JSON.stringify({ nodes: [{ id: 'a', next: ['missing'] }] })).toString('base64');
      h.ctx.md = md.replace(/vibeflow-graph-v1:[A-Za-z0-9+/=]+/, 'vibeflow-graph-v1:' + payload);
      assert.throws(() => h.run('parseMarkdown(md)'), /连线结构无效/);
    });
    await test('Workflow text and inline action arguments cannot escape their HTML contexts', async () => {
      const h = setup(); h.ctx.bad = '<img src=x onerror=alert(1)> " \' &';
      const safe = h.run('escapeWorkflowHtml(bad)'); assert(!safe.includes('<img')); assert(safe.includes('&lt;img'));
      h.ctx.badId = "a');globalThis.unexpectedExecution=true;//";
      const encoded = h.run('workflowActionArg(badId)');
      const decoded = encoded.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      assert.equal(JSON.parse(decoded), h.ctx.badId);
      h.run('historyManager.undo();workflowData.push({id:"changed"});historyManager.redo();');
    });
    await test('Bundled LZString reads historical compressed Unicode data', async () => {
      const newHtml = Buffer.from(shell.match(/const PROMPT_HTML_BASE64\s*=\s*'([^']+)'/)[1], 'base64').toString('utf8');
      const newCode = Buffer.from(newHtml.match(/Bundled lz-string[^>]+--><script src="data:text\/javascript;base64,([^\"]+)"/)[1], 'base64').toString('utf8');
      const current = {}; vm.createContext(current); vm.runInContext(newCode, current);
      const text = JSON.stringify({ title: '旧版会话 🙂', versions: [{ id: 'old', draft: { prompt: '保留数据'.repeat(500) } }] });
      // Produced once by the original V3.4 file's embedded LZString, not the new codec.
      const historical = Buffer.from('4RsrCExBVmBRBdgAWSTwdEcJ0SClcmRvaAAmL2JwsD3wAC1AIGshJzBO0AeFByExwFokIKhoxFubciEKIAaBZmAJWADwKtAFNEs3SEg/ygkgdFR11gPIGPlq11Z+O8NORkPvBn50VR+UORV3u12uJz0u+F+efhN2D3bfd7APRDA2EBAQJ0fDQsERCFlsXFEpsBJvS4dE8hO5WfxUfnZIJ3JYSygEGKsrdWXySpVtxi74VIhp1zVbag1O7i6Pa8879FM5HC0MGkjjE8lxCGWadlM3IAkbAyEW6zogICAA', 'base64').toString('utf16le');
      assert.equal(current.LZString.decompressFromUTF16(historical), text);
    });
    await test('All three documents compile and contain no external script dependency', async () => {
      const documents = [shell, html, Buffer.from(shell.match(/const PROMPT_HTML_BASE64\s*=\s*'([^']+)'/)[1], 'base64').toString('utf8')];
      for (const doc of documents) {
        assert(!/<script\b[^>]*src=["']https?:/i.test(doc));
        for (const script of doc.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
          const data = script[1].match(/src="data:text\/javascript;base64,([^\"]+)"/);
          new vm.Script(data ? Buffer.from(data[1], 'base64').toString('utf8') : script[2]);
        }
      }
    });
    await test('Prompt IDE JSON export keeps all versions, turns and drafts', async () => {
      const promptHtml = Buffer.from(shell.match(/const PROMPT_HTML_BASE64\s*=\s*'([^']+)'/)[1], 'base64').toString('utf8');
      const sample = { id: 'demo', title: '公开示例', versions: [{ id: 'v1', name: 'A', turns: [{id:'p1',content:'original'}], draft: {} }, { id: 'v2', name: 'B', turns: [{id:'p2',content:'alternative'}], draft: {prompt:'unfinished'} }] };
      const context = { app: { currentConvId: 'demo', getConversation: () => sample }, alert() {}, exported: null };
      vm.createContext(context);
      vm.runInContext(promptHtml.slice(promptHtml.indexOf('class Exporter {'), promptHtml.indexOf('        const app = new AppStore();')) + 'const exporter=new Exporter();exporter.dl=content=>{exported=content};exporter.export("json");', context);
      assert.deepEqual(JSON.parse(context.exported), sample);
    });
    await test('Creating a comparison version leaves prior turns and draft intact', async () => {
      const promptHtml = Buffer.from(shell.match(/const PROMPT_HTML_BASE64\s*=\s*'([^']+)'/)[1], 'base64').toString('utf8');
      const sample = { id: 'demo', versions: [{ id: 'v1', name: 'A', turns: [{id:'p1',content:'original'}], draft: {prompt:'original draft'} }] };
      const context = { app: { getConversation: () => sample, saveConversation() {} }, Utils: { uuid: () => 'v2' }, requestVersionName: async () => 'B', renderWorkspace() {}, emitPromptIDEEvent() {} };
      vm.createContext(context);
      const a = promptHtml.indexOf('async function addVer() {'), b = promptHtml.indexOf('        function delVer(', a);
      vm.runInContext(promptHtml.slice(a,b),context); await context.addVer();
      assert.equal(sample.versions.length, 2); assert.equal(sample.versions[0].turns[0].content, 'original');
      assert.equal(sample.versions[0].draft.prompt, 'original draft'); assert.equal(sample.versions[1].turns.length, 0);
      assert.equal(Object.keys(sample.versions[1].draft).length, 0);
    });
  }
  console.log(JSON.stringify({ input: path.basename(input), results }, null, 2));
  if (results.some(r => !r.pass)) process.exitCode = 1;
})();

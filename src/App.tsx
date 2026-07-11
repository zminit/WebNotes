import { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import ThreeScene from './ThreeScene';

type Note = 'nerf' | 'ml' | 'graphics' | 'home';
const outline = [
  ['01', '问题：新视角合成'], ['02', '场表示：5D NeRF'], ['03', '网络结构与维度'], ['04', '体渲染'],
  ['05', '训练与层级采样'], ['06', '实验、贡献与局限'],
];

export default function App() {
  const [open, setOpen] = useState('rendering'); const [note, setNote] = useState<Note>('nerf'); const [angle, setAngle] = useState(25); const [light, setLight] = useState(true);
  return <div className={'app-shell '+(light ? 'light' : '')}>
    <aside className="sidebar">
      <button className="logo" onClick={() => { setOpen('rendering'); setNote('home'); }}><span>W</span> WebNotes</button>
      <nav className="catalog" aria-label="知识栏目">
        <NavGroup title="机器学习" open={open === 'ml'} onToggle={() => { setOpen('ml'); setNote('ml'); }} notes={['监督学习','深度学习基础']} onNote={() => setNote('ml')} />
        <NavGroup title="神经渲染" open={open === 'rendering'} onToggle={() => { setOpen('rendering'); setNote('home'); }} notes={['NeRF：论文精读','体渲染基础','新视角合成']} active={note === 'nerf'} onNote={(i) => setNote(i === 0 ? 'nerf' : 'home')} />
        <NavGroup title="图形学" open={open === 'graphics'} onToggle={() => { setOpen('graphics'); setNote('graphics'); }} notes={['光照与材质','几何变换','实时渲染']} onNote={() => setNote('graphics')} />
      </nav>
      <div className="side-bottom"><button className="theme-button" onClick={() => setLight(!light)}>{light ? '切换深色实验室风' : '切换浅色学术风'}</button><p>LIGHT ACADEMIC<br/>NOTE SYSTEM</p></div>
    </aside>
    <main className="content">
      {note === 'nerf' ? <NerfPaper angle={angle} setAngle={setAngle} /> : <Placeholder title={note === 'ml' ? '机器学习' : note === 'graphics' ? '图形学' : 'WebNotes'} />}
    </main>
  </div>;
}

function NavGroup({ title, open, onToggle, notes, onNote, active }: {title:string;open:boolean;onToggle:()=>void;notes:string[];onNote:(i:number)=>void;active?:boolean}) { return <div className={'catalog-item '+(open ? 'open' : '')}><button className="category" onClick={onToggle}><span>{title}</span><b>{open ? '−' : '+'}</b></button>{open && <div className="notes">{notes.map((n,i) => <button key={n} className={active && i === 0 ? 'active' : ''} onClick={() => onNote(i)}>{n}</button>)}</div>}</div> }

function NerfPaper({ angle, setAngle }: {angle:number;setAngle:(v:number)=>void}) { return <>
  <header className="note-head"><div><span>神经渲染 / 论文精读</span><h1>NeRF：以神经辐射场表示场景</h1><p>对 Mildenhall et al., ECCV 2020《NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis》的结构化阅读笔记。</p></div><a href="https://arxiv.org/abs/2003.08934" target="_blank" rel="noreferrer">arXiv ↗</a></header>
  <section className="abstract-card"><b>一句话摘要</b><p>NeRF 将一个静态场景编码为连续函数：在任意空间位置查询<strong>体密度</strong>，并结合观察方向查询<strong>辐射颜色</strong>；对相机射线上的连续场做可微体渲染，就能由已知图片与位姿优化该函数并合成新视角。</p><div className="outline">{outline.map(([n,t]) => <a href={'#s'+n} key={n}><small>{n}</small>{t}</a>)}</div></section>
  <PaperSection id="s01" number="01" title="问题：为什么需要 NeRF？" lead="输入是一组具有相机内外参的 RGB 图像；目标是从未拍摄过的相机位姿生成一致、逼真的图像（novel view synthesis）。它不是在预测一个类别，也不是直接输出网格。">
    <div className="two"><div className="panel"><h3>论文面对的取舍</h3><dl><dt>显式体素 / MPI</dt><dd>可用体渲染拟合复杂外观，但高分辨率 3D 网格的时间和存储成本随采样密度急剧增长。</dd><dt>网格优化</dt><dd>需要初始拓扑，且由图像重投影直接优化容易陷入局部极小。</dd><dt>早期隐式表面</dt><dd>常在单一表面交点取色，对透明、半透明、细小结构和视角相关高光表达不足。</dd></dl></div><div className="panel"><h3>NeRF 的回答</h3><p>把场景作为一个 <b>连续的、每场景优化的</b> 体函数，网络参数取代稠密网格；颜色是 5D 的，因此同一点可因观察方向不同出现高光或非朗伯外观。</p><div className="callout">必要条件：静态场景、已知或可估计的相机位姿/内参，以及每张图像的射线边界。原论文真实数据使用 COLMAP 估计相机参数。</div></div></div>
  </PaperSection>
  <PaperSection id="s02" number="02" title="场表示：从 5D 坐标到密度与辐射" lead="NeRF 不是“把一张图送进网络”。渲染时，对每个目标像素生成一条射线，并在射线上查询同一个神经场。">
    <div className="two"><div className="panel visual"><ThreeScene angle={angle} light /><span>新相机射线指向连续场</span></div><div className="panel formula-panel"><BlockMath math={'F_\\Theta:\ (\\mathbf{x},\\mathbf{d})\\mapsto(\\sigma,\\mathbf{c})'}/><ul><li><InlineMath math="\mathbf{x}\in\mathbb{R}^3"/>：空间位置。</li><li><InlineMath math="\mathbf d\in\mathbb{S}^2"/>：理论上是 2D 方向；实现中用 3D 单位向量表示。</li><li><InlineMath math="\sigma\in\mathbb{R}_{\ge0}"/>：微分不透明度/射线在此终止的密度。</li><li><InlineMath math="\mathbf c\in[0,1]^3"/>：沿方向发出的 RGB 辐射。</li></ul><label className="range">观察方向 <output>{angle}°</output><input type="range" min="-70" max="70" value={angle} onChange={e=>setAngle(+e.target.value)}/></label></div></div>
  </PaperSection>
  <PaperSection id="s03" number="03" title="网络结构与维度：论文图 7 背后的张量" lead="关键设计是把几何与外观分开：σ 不接受方向输入，因而多视角共享同一密度场；RGB 才接收方向，负责非朗伯反射。">
    <div className="architecture"><div className="arch-column"><small>位置编码</small><b>γ(x)</b><em>63</em><span>3 + 2×3×10</span></div><i>→</i><div className="arch-column wide"><small>位置 MLP</small><b>8 × FC + ReLU</b><em>256 channels</em><span>第 5 层后拼接 γ(x)：256 + 63 = 319</span></div><i>→</i><div className="arch-split"><div><b>σ</b><em>1</em></div><div><b>feature h</b><em>256</em></div></div><i>→</i><div className="arch-column"><small>方向融合</small><b>[h, γ(d)]</b><em>283</em><span>256 + 27</span></div><i>→</i><div className="arch-column"><small>颜色头</small><b>FC + ReLU</b><em>128 → 3</em><span>RGB</span></div></div>
    <div className="two"><div className="panel"><h3>位置编码实际维度</h3><BlockMath math={'\\gamma(p)=(p,\sin(2^0\\pi p),\cos(2^0\\pi p),...,\sin(2^{L-1}\\pi p),\cos(2^{L-1}\\pi p))'}/><p>论文使用 <InlineMath math="L_x=10"/>、<InlineMath math="L_d=4"/>。released code 保留原输入，因此 <InlineMath math="\gamma(\mathbf{x})"/> 为 63 维，<InlineMath math="\gamma(\mathbf d)"/> 为 27 维。高频映射缓解 MLP 的低频偏置，才可拟合细纹理和几何边缘。</p></div><div className="panel"><h3>一个容易误读的细节</h3><p>论文正文描述：位置分支为 8 个、每层 256 通道的全连接层；方向分支为 1 个、128 通道的 ReLU 层后输出 RGB。官方 released code 还注明补充材料声称方向分支有 4 个隐藏层是笔误，实验实际使用 1 个。</p><div className="callout">Coarse 与 fine 是两套独立、同构的网络；并不是一个网络的两个输出头。</div></div></div>
  </PaperSection>
  <PaperSection id="s04" number="04" title="体渲染：网络输出如何变成一个像素？" lead="NeRF 的监督能从 2D 图像传回 3D 场，是因为离散 alpha compositing 对 σ 和 c 都可微。">
    <div className="two"><div className="panel"><h3>连续形式</h3><BlockMath math={'C(\\mathbf r)=\\int_{t_n}^{t_f}T(t)\\sigma(\\mathbf r(t))\\mathbf c(\\mathbf r(t),\\mathbf d)\,dt,\quad\\mathbf r(t)=\\mathbf o+t\\mathbf d'}/><BlockMath math={'T(t)=\\exp\\left(-\\int_{t_n}^{t}\\sigma(\\mathbf r(s))ds\\right)'}/><p><InlineMath math="T(t)"/> 是到达 t 前没有被遮挡的透射率；<InlineMath math="\sigma(t)dt"/> 是在该微段终止的概率质量。</p></div><div className="panel"><h3>训练中使用的离散形式</h3><BlockMath math={'\\hat C(\\mathbf r)=\\sum_{i=1}^{N}w_i\\mathbf c_i,\quad w_i=T_i\\alpha_i'}/><BlockMath math={'\\alpha_i=1-e^{-\\sigma_i\\delta_i},\quad T_i=\\exp\\left(-\\sum_{j<i}\\sigma_j\\delta_j\\right),\quad\\delta_i=t_{i+1}-t_i'}/><p>这不是“取最大密度点的颜色”：每个点都按可见性加权。前方密度升高会使后方 <InlineMath math="T_i"/> 下降。</p></div></div>
  </PaperSection>
  <PaperSection id="s05" number="05" title="优化：分层采样、粗细网络与损失" lead="只均匀密集采样很浪费：自由空间与被遮挡区域通常不贡献颜色。论文用 coarse 网络学习在哪里值得继续询问。">
    <div className="sampling-flow"><div><b>① Stratified</b><span>沿 [tₙ,tƒ] 划分 N₍c₎ 区间，每段均匀随机取点</span></div><i>→</i><div><b>② Coarse NeRF</b><span>查询 σ,c；由 wᵢ 构造分段常数 PDF</span></div><i>→</i><div><b>③ Inverse CDF</b><span>按 PDF 额外抽 N₍f₎ 点，集中在高权重区域</span></div><i>→</i><div><b>④ Fine NeRF</b><span>在两批点的并集上渲染最终颜色</span></div></div>
    <div className="two"><div className="panel"><h3>为什么 coarse 也要计算 loss？</h3><BlockMath math={'\\mathcal L=\\sum_{\\mathbf r\\in\\mathcal R}\left[\\|\\hat C_c(\\mathbf r)-C(\\mathbf r)\\|_2^2+\\|\\hat C_f(\\mathbf r)-C(\\mathbf r)\\|_2^2\\right]'}/><p>Fine 的采样分布来自 coarse 的权重。若不监督 coarse，它不会学到有意义的 PDF，无法为 fine 分配计算预算。</p></div><div className="panel"><h3>原论文训练配置</h3><dl><dt>每条射线</dt><dd><InlineMath math="N_c=64"/> 个 coarse 样本，另加 <InlineMath math="N_f=128"/> 个 fine 样本。</dd><dt>每一轮</dt><dd>随机抽取 4096 条训练射线；Adam 初始学习率 5×10⁻⁴，指数衰减到 5×10⁻⁵。</dd><dt>每个场景</dt><dd>独立训练 100k–300k 次迭代。原论文报告单张 V100 约 1–2 天。</dd></dl></div></div>
  </PaperSection>
  <PaperSection id="s06" number="06" title="论文贡献、结果与今天应如何看待它" lead="NeRF 的重要性不在于一个单独的 MLP，而在于连续场、位置编码、可微体渲染和重要性采样形成的可训练闭环。">
    <div className="two"><div className="panel"><h3>论文验证了什么？</h3><ul><li>视角相关颜色对高光与非朗伯材质重要；移除它会损害镜面外观。</li><li>移除位置编码会出现严重的过度平滑，丢失高频纹理/几何。</li><li>移除 hierarchical sampling 会降低采样效率与结果质量。</li><li>相较当时的 LLFF、SRN、Neural Volumes，在合成和真实场景的新视角任务取得更好的视觉一致性与量化表现。</li></ul></div><div className="panel"><h3>原始方法的边界</h3><ul><li>每个场景从头训练，训练和渲染都慢；这正是 Instant-NGP、Plenoxels、3D Gaussian Splatting 等后续工作的突破点。</li><li>假定静态场景，不能直接处理动态物体、光照变化或反射/折射的完整物理变化。</li><li>依赖准确位姿、内参与合理的射线边界；现实采集质量会直接限制结果。</li><li>网络权重是压缩的场表示，却不如网格/体素直观，分析失败模式较困难。</li></ul></div></div>
    <div className="citation">来源：Mildenhall et al., <i>NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis</i>, ECCV 2020；实现细节对照作者公开代码。<a href="https://arxiv.org/abs/2003.08934" target="_blank" rel="noreferrer">arXiv:2003.08934</a></div>
  </PaperSection>
</> }

function PaperSection({id,number,title,lead,children}:{id:string;number:string;title:string;lead:string;children:React.ReactNode}) { return <section id={id} className="paper-section"><small>{number} · PAPER READING</small><h2>{title}</h2><p className="lead">{lead}</p>{children}</section> }
function Placeholder({title}:{title:string}) { return <div className="placeholder"><small>WEBNOTES</small><h1>{title}</h1><p>选择左侧的一篇笔记开始探索。</p></div> }

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Lightbulb,
  Cpu,
  BookOpen,
  Trophy,
  GraduationCap,
  Sparkles,
  Gauge,
  FileChartColumn,
  CircuitBoard,
} from "lucide-react";

type Level = {
  key: "intro" | "basic" | "advanced";
  label: string;
  audience: string;
  description: string;
};

type StepItem = {
  id: string;
  label: string;
  detail: string;
};

type DrawingComponent = {
  type: "contact" | "coil" | "lamp" | "timer";
  name: string;
  detail: string;
};

type DrawingBranch = {
  label: string;
  components: DrawingComponent[];
};

type Drawing = {
  title: string;
  leftLabel: string;
  rightLabel: string;
  supply: string;
  branches: DrawingBranch[];
};

type Quiz = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type SimResult = {
  output: boolean;
  activeIndices: number[];
  latch?: boolean;
  nextTimerTick?: number;
};

type Simulator = {
  inputs: string[];
  outputLabel: string;
  hint: string;
  latch?: boolean;
  timer?: boolean;
  timerTicks?: number;
  evaluate: (state: { X0?: boolean; X1?: boolean; X2?: boolean; latch?: boolean; timerTick?: number }) => SimResult;
};

type Lesson = {
  id: number;
  track: Level["key"];
  title: string;
  level: string;
  concept: string;
  points: string[];
  steps: StepItem[];
  drawing: Drawing;
  quiz: Quiz;
  simulator: Simulator;
};

const levels: Level[] = [
  { key: "intro", label: "初級", audience: "高校生・文系向け", description: "まずは信号の流れと機器の役割をやさしく理解する" },
  { key: "basic", label: "中級", audience: "大学生向け", description: "自己保持や順序制御など、現場でよく使う考え方を学ぶ" },
  { key: "advanced", label: "上級", audience: "理系・技術志向向け", description: "安全回路やインターロックを含む実務的な見方まで踏み込む" },
];

const lessons: Lesson[] = [
  {
    id: 1,
    track: "intro",
    title: "信号が流れる順番を知る",
    level: "初級",
    concept: "入力から出力まで、どの順番で動作がつながるのかをつかむ最初の題目。",
    points: [
      "スタート入力が入ると内部で条件確認が始まる",
      "条件成立後にリレーやランプへ信号が渡る",
      "回路記号より先に、動作の順番を読むことが大切",
    ],
    steps: [
      { id: "s1", label: "電源ON", detail: "制御電源が入り回路が待機する" },
      { id: "s2", label: "安全確認", detail: "安全スイッチが成立していることを確認する" },
      { id: "s3", label: "スタート入力", detail: "操作ボタンが押され信号が流れ始める" },
      { id: "s4", label: "表示灯ON", detail: "最後に表示灯が点灯する" },
    ],
    drawing: {
      title: "表示灯起動回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "安全確認",
          components: [
            { type: "contact", name: "X1", detail: "安全SW" },
            { type: "contact", name: "X0", detail: "START" },
            { type: "coil", name: "RY1", detail: "内部リレー" },
          ],
        },
        {
          label: "表示灯",
          components: [
            { type: "contact", name: "RY1", detail: "補助接点" },
            { type: "lamp", name: "L1", detail: "表示灯" },
          ],
        },
      ],
    },
    quiz: {
      question: "初学者が最初に注目すると理解しやすいのはどれですか？",
      options: [
        "配線番号だけを見る",
        "信号がどの順番で出力へ届くかを追う",
        "すべての規格番号を覚える",
        "上級の安全回路から学ぶ",
      ],
      answer: 1,
      explanation: "最初は回路の細部よりも、入力から出力へどんな順番でつながるかを理解するのが効果的です。",
    },
    simulator: {
      inputs: ["スタートボタン", "安全スイッチ"],
      outputLabel: "表示灯",
      evaluate: ({ X0, X1 }) => ({ output: !!X0 && !!X1, activeIndices: X0 && X1 ? [0, 1, 2, 3] : X1 ? [0, 1] : [0] }),
      hint: "安全スイッチをONにしてからスタートを押すと、最後まで信号が進みます。",
    },
  },
  {
    id: 2,
    track: "intro",
    title: "AND条件で動かす",
    level: "初級",
    concept: "複数の条件がそろったときだけ動く、基本的な条件制御を学ぶ。",
    points: [
      "2つ以上の条件を満たしてはじめて出力できる",
      "装置の誤動作防止に基本条件の組み合わせは重要",
      "シーケンス図では途中で止まる場所が見やすい",
    ],
    steps: [
      { id: "s1", label: "電源待機", detail: "制御系は待機中" },
      { id: "s2", label: "安全扉閉", detail: "安全条件の1つが成立" },
      { id: "s3", label: "起動スイッチON", detail: "操作条件が加わる" },
      { id: "s4", label: "モータ起動", detail: "両条件成立で出力が動作" },
    ],
    drawing: {
      title: "両条件成立回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "条件成立",
          components: [
            { type: "contact", name: "X1", detail: "扉SW" },
            { type: "contact", name: "X0", detail: "起動PB" },
            { type: "coil", name: "M1", detail: "モータ接触器" },
          ],
        },
      ],
    },
    quiz: {
      question: "AND条件の説明として正しいものはどれですか？",
      options: [
        "どちらか1つがONなら出力する",
        "すべての条件がそろったときだけ出力する",
        "条件がなくても常に動く",
        "一度動いたら条件を無視する",
      ],
      answer: 1,
      explanation: "AND条件は、必要な条件がすべてそろった場合のみ出力が成立します。",
    },
    simulator: {
      inputs: ["起動スイッチ", "安全扉閉"],
      outputLabel: "モータ",
      evaluate: ({ X0, X1 }) => ({ output: !!X0 && !!X1, activeIndices: X0 && X1 ? [0, 1, 2, 3] : X1 ? [0, 1] : [0] }),
      hint: "片方だけONでは止まり、両方ONで最後まで進むことを確認します。",
    },
  },
  {
    id: 3,
    track: "intro",
    title: "OFF条件で止まる",
    level: "初級",
    concept: "停止ボタンや非常停止のように、動作を止める条件の見方を学ぶ。",
    points: [
      "止める回路は安全設計の第一歩",
      "通常時は通電し、押すと切れる考え方を理解する",
      "起動回路と停止回路をセットで見る習慣が大切",
    ],
    steps: [
      { id: "s1", label: "待機", detail: "停止条件が正常な状態" },
      { id: "s2", label: "起動成立", detail: "運転条件が入り出力がON" },
      { id: "s3", label: "停止押下", detail: "停止ボタンで経路が遮断される" },
      { id: "s4", label: "出力OFF", detail: "最終出力が停止する" },
    ],
    drawing: {
      title: "停止付き回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "運転",
          components: [
            { type: "contact", name: "X1", detail: "STOP" },
            { type: "contact", name: "X0", detail: "START" },
            { type: "coil", name: "Y0", detail: "運転出力" },
          ],
        },
      ],
    },
    quiz: {
      question: "停止条件を学ぶうえで大切な見方はどれですか？",
      options: [
        "止める条件を考えない",
        "起動だけを見ればよい",
        "どこで回路が切れて出力が止まるかを見る",
        "出力の名前だけ覚える",
      ],
      answer: 2,
      explanation: "停止条件では、どの接点で信号が遮断されるかを見ることが大切です。",
    },
    simulator: {
      inputs: ["起動ボタン", "停止ボタン"],
      outputLabel: "運転出力",
      evaluate: ({ X0, X1 }) => ({ output: !!X0 && !X1, activeIndices: X1 ? [0] : X0 ? [0, 1, 2, 3] : [0, 1] }),
      hint: "停止ボタンをONにすると途中で経路が切れる動きを確認できます。",
    },
  },
  {
    id: 4,
    track: "basic",
    title: "自己保持で動作を継続する",
    level: "中級",
    concept: "ボタンを離しても動作を続ける自己保持の基本。",
    points: [
      "起動後は補助接点で自分自身を保持する",
      "停止入力で保持を解除する",
      "モータやポンプの基本制御でよく使う",
    ],
    steps: [
      { id: "s1", label: "待機", detail: "停止条件が正常で起動待ち" },
      { id: "s2", label: "起動入力", detail: "スタート操作でシーケンス開始" },
      { id: "s3", label: "保持成立", detail: "補助接点で自己保持が成立" },
      { id: "s4", label: "継続運転", detail: "ボタンを離しても出力継続" },
      { id: "s5", label: "停止解除", detail: "停止操作で保持が切れる" },
    ],
    drawing: {
      title: "自己保持回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "起動・停止",
          components: [
            { type: "contact", name: "X1", detail: "STOP" },
            { type: "contact", name: "X0", detail: "START" },
            { type: "contact", name: "Y0", detail: "自己保持" },
            { type: "coil", name: "Y0", detail: "モータ出力" },
          ],
        },
      ],
    },
    quiz: {
      question: "自己保持の役割として最も適切なのはどれですか？",
      options: [
        "ボタンを押した瞬間だけ出力をONにする",
        "一度成立した動作を、停止条件まで継続しやすくする",
        "必ずタイマ動作を追加する",
        "すべての接点を常時ONにする",
      ],
      answer: 1,
      explanation: "自己保持は、起動後に操作ボタンを離しても動作を維持し、停止条件で解除できるようにする考え方です。",
    },
    simulator: {
      inputs: ["起動ボタン", "停止ボタン"],
      outputLabel: "モータ出力",
      latch: true,
      evaluate: ({ X0, X1, latch }) => {
        if (X1) return { output: false, latch: false, activeIndices: [0] };
        const nextLatch = !!X0 || !!latch;
        return { output: nextLatch, latch: nextLatch, activeIndices: nextLatch ? [0, 1, 2, 3, 4] : [0] };
      },
      hint: "起動を一度入れてから離しても継続し、停止で解除される流れを見ます。",
    },
  },
  {
    id: 5,
    track: "basic",
    title: "タイマで遅れて動かす",
    level: "中級",
    concept: "入力後すぐではなく、一定時間後に出力する考え方を学ぶ。",
    points: [
      "タイマは条件に時間の要素を足す部品",
      "表示灯やブザー、切替機構の遅延に多い",
      "アニメーションと組み合わせると待ち時間が直感的に分かる",
    ],
    steps: [
      { id: "s1", label: "入力成立", detail: "センサがONする" },
      { id: "s2", label: "計時開始", detail: "タイマがカウントを始める" },
      { id: "s3", label: "設定時間到達", detail: "所定時間を満たす" },
      { id: "s4", label: "出力ON", detail: "ブザーやランプが動作する" },
    ],
    drawing: {
      title: "遅延動作回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "タイマ",
          components: [
            { type: "contact", name: "X0", detail: "センサ" },
            { type: "timer", name: "T0", detail: "3s" },
          ],
        },
        {
          label: "出力",
          components: [
            { type: "contact", name: "T0", detail: "完了接点" },
            { type: "coil", name: "BZ", detail: "ブザー" },
          ],
        },
      ],
    },
    quiz: {
      question: "遅延ONタイマの完了接点がONになるタイミングはいつですか？",
      options: [
        "入力が入った瞬間",
        "入力が切れた瞬間",
        "設定時間が経過した後",
        "常にON",
      ],
      answer: 2,
      explanation: "遅延ONタイマは、入力が継続してONした状態で設定時間を超えたあとに完了します。",
    },
    simulator: {
      inputs: ["センサ入力"],
      outputLabel: "ブザー",
      timer: true,
      timerTicks: 3,
      evaluate: ({ X0, timerTick = 0 }) => {
        if (!X0) return { output: false, nextTimerTick: 0, activeIndices: [0] };
        if (timerTick < 3) return { output: false, nextTimerTick: timerTick + 1, activeIndices: [0, 1] };
        return { output: true, nextTimerTick: 3, activeIndices: [0, 1, 2, 3] };
      },
      hint: "入力ONのまま数回再生すると、時間経過後に出力がONになります。",
    },
  },
  {
    id: 6,
    track: "basic",
    title: "順序制御で工程を進める",
    level: "中級",
    concept: "1つ終わったら次へ進む、工程制御の基本的な考え方を学ぶ。",
    points: [
      "開始→動作→完了確認→次工程の流れを追う",
      "工程ごとに確認信号を入れることで誤動作を防ぎやすい",
      "製造設備の基礎として重要",
    ],
    steps: [
      { id: "s1", label: "スタート", detail: "工程開始信号が入る" },
      { id: "s2", label: "シリンダ前進", detail: "第1動作を実行" },
      { id: "s3", label: "前進端確認", detail: "端位置センサを確認" },
      { id: "s4", label: "次工程出力", detail: "次の装置へ引き継ぐ" },
    ],
    drawing: {
      title: "工程引継ぎ回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "第1工程",
          components: [
            { type: "contact", name: "X0", detail: "START" },
            { type: "coil", name: "SOL1", detail: "前進弁" },
          ],
        },
        {
          label: "第2工程",
          components: [
            { type: "contact", name: "X2", detail: "前進端" },
            { type: "coil", name: "Y1", detail: "次工程許可" },
          ],
        },
      ],
    },
    quiz: {
      question: "順序制御で重要な考え方はどれですか？",
      options: [
        "確認なしで次工程へ進む",
        "各工程の完了を確認してから次へ進む",
        "すべて同時に動かす",
        "センサは使わない",
      ],
      answer: 1,
      explanation: "順序制御では、前の工程が完了したことを確認してから次へ進めるのが基本です。",
    },
    simulator: {
      inputs: ["スタート", "前進端センサ"],
      outputLabel: "次工程許可",
      evaluate: ({ X0, X1 }) => ({ output: !!X0 && !!X1, activeIndices: X0 && X1 ? [0, 1, 2, 3] : X0 ? [0, 1] : [0] }),
      hint: "スタート後、前進端センサが入ると次工程へ進みます。",
    },
  },
  {
    id: 7,
    track: "advanced",
    title: "インターロックで同時動作を防ぐ",
    level: "上級",
    concept: "正転と逆転など、同時に成立すると危険な条件を防ぐ。",
    points: [
      "相反する出力は相互に禁止条件を入れる",
      "安全側で止まる設計が重要",
      "誤操作時の動きを読む練習になる",
    ],
    steps: [
      { id: "s1", label: "正転要求", detail: "正転入力が入る" },
      { id: "s2", label: "逆転停止確認", detail: "逆転側が動作していないことを確認" },
      { id: "s3", label: "安全成立", detail: "禁止条件が解除されている" },
      { id: "s4", label: "正転出力", detail: "正転出力がONする" },
    ],
    drawing: {
      title: "正逆インターロック回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "正転",
          components: [
            { type: "contact", name: "X0", detail: "FWD PB" },
            { type: "contact", name: "Y1", detail: "REV NC" },
            { type: "contact", name: "X2", detail: "安全OK" },
            { type: "coil", name: "Y0", detail: "正転" },
          ],
        },
        {
          label: "逆転",
          components: [
            { type: "contact", name: "X1", detail: "REV PB" },
            { type: "contact", name: "Y0", detail: "FWD NC" },
            { type: "coil", name: "Y1", detail: "逆転" },
          ],
        },
      ],
    },
    quiz: {
      question: "インターロック制御の主な目的は何ですか？",
      options: [
        "どの出力も同時にONにするため",
        "危険な同時動作を防ぐため",
        "タイマを短くするため",
        "入力数を減らすため",
      ],
      answer: 1,
      explanation: "インターロックは、正転と逆転など同時成立が危険な動作を防ぐための安全設計です。",
    },
    simulator: {
      inputs: ["正転要求", "逆転中信号", "安全OK"],
      outputLabel: "正転出力",
      evaluate: ({ X0, X1, X2 }) => {
        const ok = !!X0 && !X1 && !!X2;
        const activeIndices = [0];
        if (X0) activeIndices.push(1);
        if (X0 && !X1) activeIndices.push(2);
        if (ok) activeIndices.push(3);
        return { output: ok, activeIndices };
      },
      hint: "逆転中なら途中で止まり、安全OKがあると最後まで進みます。",
    },
  },
  {
    id: 8,
    track: "advanced",
    title: "非常停止回路を読む",
    level: "上級",
    concept: "参考図面のような非常停止・異常時停止回路の読み方を学ぶ。",
    points: [
      "非常停止は装置全体を安全側へ止めるための要点",
      "異常時はどの接点で遮断されるかを読む",
      "ハード設計では実図面との対応づけが重要",
    ],
    steps: [
      { id: "s1", label: "通常待機", detail: "非常停止回路は正常状態で監視中" },
      { id: "s2", label: "非常停止押下", detail: "EMG入力で回路が遮断される" },
      { id: "s3", label: "主出力遮断", detail: "内部リレーや出力が落ちる" },
      { id: "s4", label: "警報表示", detail: "ブザーや表示で異常を知らせる" },
    ],
    drawing: {
      title: "非常停止・警報回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "非常停止OFF",
          components: [
            { type: "contact", name: "EMG", detail: "EMG PB" },
            { type: "contact", name: "RST", detail: "復帰条件" },
            { type: "coil", name: "EMGX", detail: "非常停止リレー" },
          ],
        },
        {
          label: "ブザー",
          components: [
            { type: "contact", name: "EMGX", detail: "異常接点" },
            { type: "contact", name: "BZX", detail: "停止PB" },
            { type: "lamp", name: "BZ", detail: "ブザー" },
          ],
        },
      ],
    },
    quiz: {
      question: "非常停止回路で最も重視すべき視点はどれですか？",
      options: [
        "見た目の整列だけ",
        "異常時に安全側へ止まること",
        "部品数を増やすこと",
        "常に再起動しやすいことだけ",
      ],
      answer: 1,
      explanation: "非常停止回路では、異常時に装置が安全側へ確実に停止することが最優先です。",
    },
    simulator: {
      inputs: ["非常停止PB", "復帰条件", "ブザー停止PB"],
      outputLabel: "警報ブザー",
      evaluate: ({ X0, X1, X2 }) => {
        const emgRelay = !X0 && !!X1;
        const buzzer = !!X0 && !X2;
        const activeIndices = X0 ? [0, 1, 2, 3] : emgRelay ? [0, 1] : [0];
        return { output: buzzer, activeIndices };
      },
      hint: "非常停止PBをONにしたとき、出力遮断と警報側の流れを見比べられます。",
    },
  },
  {
    id: 9,
    track: "advanced",
    title: "異常復帰と再始動条件",
    level: "上級",
    concept: "異常が解除されても、すぐに再始動せず確認後に復帰する考え方を学ぶ。",
    points: [
      "安全解除後も再始動条件を分けて考える",
      "復帰ボタンや確認信号を使うことで不用意な再起動を防ぐ",
      "実務では保全性と安全性の両立が重要",
    ],
    steps: [
      { id: "s1", label: "異常解除", detail: "異常要因がなくなる" },
      { id: "s2", label: "復帰入力", detail: "オペレータが復帰操作を行う" },
      { id: "s3", label: "再始動許可", detail: "安全確認後に再始動が許可される" },
      { id: "s4", label: "運転再開", detail: "出力を再投入できる" },
    ],
    drawing: {
      title: "復帰・再始動回路",
      leftLabel: "1MRC13",
      rightLabel: "1MSC13",
      supply: "AC220V",
      branches: [
        {
          label: "復帰条件",
          components: [
            { type: "contact", name: "ALM", detail: "異常解除" },
            { type: "contact", name: "RST", detail: "復帰PB" },
            { type: "contact", name: "SAFE", detail: "安全OK" },
            { type: "coil", name: "RUNEN", detail: "再始動許可" },
          ],
        },
      ],
    },
    quiz: {
      question: "異常復帰後の設計として望ましいものはどれですか？",
      options: [
        "異常が消えた瞬間に自動で必ず再始動する",
        "復帰確認と安全確認の後に再始動できるようにする",
        "復帰操作は不要にする",
        "安全条件を無視して運転再開する",
      ],
      answer: 1,
      explanation: "異常解除後は、オペレータの復帰確認と安全確認を経てから再始動できる設計が望まれます。",
    },
    simulator: {
      inputs: ["異常解除", "復帰PB", "安全OK"],
      outputLabel: "再始動許可",
      evaluate: ({ X0, X1, X2 }) => ({ output: !!X0 && !!X1 && !!X2, activeIndices: X0 && X1 && X2 ? [0, 1, 2, 3] : X0 && X1 ? [0, 1, 2] : X0 ? [0, 1] : [0] }),
      hint: "異常解除だけでは不足し、復帰PBと安全OKで最後まで進む構成です。",
    },
  },
];

const appStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, "Noto Sans JP", system-ui, sans-serif; background: #e8edf3; color: #0f172a; }
  button, input { font: inherit; }
  .app-shell { min-height: 100vh; background: linear-gradient(135deg, #e2e8f0 0%, #ffffff 45%, #dbe4ef 100%); padding: 24px; }
  .app-wrap { max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
  .card { background: rgba(255,255,255,0.96); border: 1px solid rgba(148,163,184,0.2); border-radius: 24px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
  .hero-card { padding: 28px; }
  .hero-grid { display: grid; gap: 24px; grid-template-columns: 1.7fr 1fr; align-items: center; }
  .badge-row, .badge-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 12px; border: 1px solid #cbd5e1; background: #fff; color: #334155; }
  .badge-solid { background: #0f172a; border-color: #0f172a; color: #fff; }
  .hero-title { margin: 0; font-size: 42px; line-height: 1.15; }
  .hero-desc { margin: 12px 0 0; color: #475569; line-height: 1.8; }
  .progress-panel { background: #0f172a; color: white; border-radius: 24px; padding: 20px; }
  .progress-label { display: flex; align-items: center; gap: 8px; color: #cbd5e1; font-size: 14px; }
  .progress-value { font-size: 42px; font-weight: 800; margin-top: 10px; }
  .progress-bar { width: 100%; height: 12px; border-radius: 999px; background: rgba(255,255,255,0.12); overflow: hidden; margin-top: 10px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #60a5fa, #34d399); }
  .section-card { padding: 22px; }
  .section-title-row { display: flex; align-items: center; gap: 10px; }
  .section-title { margin: 0; font-size: 24px; }
  .section-desc { color: #64748b; margin-top: 6px; }
  .level-grid { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0,1fr)); margin-top: 16px; }
  .level-btn, .lesson-btn, .option-btn, .input-toggle, .tab-btn { transition: .2s ease; }
  .level-btn, .lesson-btn, .input-toggle, .option-btn { border: 1px solid #cbd5e1; background: white; border-radius: 20px; padding: 16px; text-align: left; cursor: pointer; }
  .level-btn.active, .lesson-btn.active, .input-toggle.active { background: #0f172a; color: white; border-color: #0f172a; }
  .level-sub, .lesson-sub { font-size: 12px; opacity: .72; }
  .level-name { font-size: 20px; font-weight: 700; margin-top: 6px; }
  .level-desc { margin-top: 8px; line-height: 1.7; font-size: 14px; }
  .layout-grid { display: grid; gap: 24px; grid-template-columns: 320px 1fr; }
  .lesson-list { padding: 22px; align-self: start; }
  .lesson-stack { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
  .lesson-title { font-weight: 700; margin-top: 4px; }
  .checkmark { flex-shrink: 0; }
  .tabs-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: rgba(226,232,240,0.9); padding: 8px; border-radius: 18px; }
  .tab-btn { border: none; border-radius: 14px; padding: 12px 14px; background: transparent; cursor: pointer; font-weight: 600; color: #334155; }
  .tab-btn.active { background: white; box-shadow: 0 4px 12px rgba(15,23,42,0.08); }
  .panel-stack { display: flex; flex-direction: column; gap: 16px; }
  .content-card { padding: 22px; }
  .sequence-block { background: #020617; border-radius: 28px; padding: 20px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
  .sequence-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0,1fr)); }
  .step-box { border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #cbd5e1; padding: 16px; min-height: 126px; }
  .step-box.active { border-color: #34d399; background: rgba(52,211,153,0.12); color: white; }
  .step-label { font-size: 12px; opacity: .7; }
  .step-title { margin-top: 6px; font-weight: 700; }
  .step-detail { margin-top: 10px; font-size: 14px; line-height: 1.7; }
  .point-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0,1fr)); margin-top: 16px; }
  .point-box { background: #f8fafc; border-radius: 16px; padding: 14px; color: #334155; line-height: 1.7; font-size: 14px; }
  .quiz-options { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
  .option-btn.selected { border-color: #0f172a; background: #f1f5f9; }
  .btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  .btn { border: none; border-radius: 14px; padding: 11px 16px; background: #0f172a; color: white; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
  .btn.secondary { background: white; color: #0f172a; border: 1px solid #cbd5e1; }
  .btn:disabled { opacity: .45; cursor: not-allowed; }
  .feedback { margin-top: 14px; border-radius: 16px; padding: 14px; font-size: 14px; line-height: 1.7; }
  .feedback.ok { background: #ecfdf5; color: #065f46; }
  .feedback.ng { background: #fff1f2; color: #9f1239; }
  .sim-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0,1fr)); }
  .input-title { font-size: 12px; opacity: .72; }
  .input-name { font-weight: 700; margin-top: 4px; }
  .input-state { margin-top: 10px; font-size: 14px; }
  .speed-grid { display: grid; gap: 16px; grid-template-columns: 1.1fr .9fr; }
  .soft-panel { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 20px; padding: 16px; }
  .dark-panel { background: #0f172a; color: white; border-radius: 20px; padding: 16px; }
  .slider-wrap { margin-top: 14px; }
  .range { width: 100%; }
  .range-meta { margin-top: 8px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
  .range-meta.dark { color: #cbd5e1; }
  .subtabs { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; background: rgba(226,232,240,0.8); padding: 8px; border-radius: 18px; }
  .result-grid { display: grid; gap: 16px; grid-template-columns: 1.2fr .8fr; }
  .drawing-wrap { border-radius: 28px; border: 1px solid #e2e8f0; background: white; padding: 18px; }
  .drawing-canvas { overflow-x: auto; border-radius: 20px; border: 1px solid #e2e8f0; background: #f8fafc; padding: 16px; margin-top: 14px; }
  .drawing-inner { min-width: 980px; }
  .drawing-line { height: 1px; background: #0f172a; }
  .drawing-header, .drawing-footer { display: flex; justify-content: space-between; font-size: 12px; color: #475569; font-weight: 600; }
  .branch-grid { margin-top: 24px; display: grid; gap: 24px; }
  .branch-col { position: relative; min-height: 320px; padding: 0 16px; }
  .branch-rail { position: absolute; left: 32px; top: 0; bottom: 64px; width: 1px; background: #475569; }
  .branch-stack { display: flex; flex-direction: column; gap: 20px; padding-left: 4px; }
  .component-row { position: relative; display: flex; align-items: center; gap: 12px; }
  .component-dot { width: 12px; height: 12px; border-radius: 999px; border: 2px solid #475569; background: white; z-index: 1; }
  .component-link { width: 32px; height: 1px; background: #475569; }
  .component-box { min-width: 150px; border-radius: 12px; border: 1px solid #cbd5e1; padding: 10px 12px; background: white; color: #475569; }
  .component-box.active.contact { border-color: #0ea5e9; background: #f0f9ff; color: #0c4a6e; }
  .component-box.active.coil, .component-box.active.lamp { border-color: #10b981; background: #ecfdf5; color: #065f46; }
  .component-box.active.timer { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
  .component-name { font-weight: 700; }
  .component-detail { font-size: 12px; opacity: .8; margin-top: 4px; }
  .branch-label { position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; font-size: 14px; font-weight: 700; color: #334155; }
  .branch-bottom { position: absolute; bottom: 24px; left: 32px; right: 32px; height: 1px; background: #475569; }
  .log-box { border: 1px dashed #cbd5e1; border-radius: 20px; padding: 16px; }
  .log-stack { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
  .log-item { border-radius: 14px; background: #f8fafc; padding: 10px 12px; color: #334155; font-size: 14px; }
  .memo-input { width: 100%; height: 48px; border-radius: 14px; border: 1px solid #cbd5e1; padding: 0 14px; }
  .memo-box { min-height: 180px; border: 1px dashed #cbd5e1; border-radius: 18px; padding: 14px; color: #475569; white-space: pre-wrap; }
  @media (max-width: 1100px) {
    .hero-grid, .layout-grid, .speed-grid, .result-grid { grid-template-columns: 1fr; }
    .level-grid, .point-grid, .sequence-grid, .sim-grid { grid-template-columns: 1fr; }
  }
`;

function IconLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}{text}</div>;
}

function SequenceDiagram({ lesson, animatedStep }: { lesson: Lesson; animatedStep: number }) {
  return (
    <div className="sequence-block">
      <div className="badge-wrap" style={{ marginBottom: 16 }}>
        <span className="badge" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.14)" }}>シーケンス図</span>
        <span className="badge" style={{ background: "transparent", color: "#cbd5e1", borderColor: "rgba(255,255,255,0.14)" }}>{lesson.level}</span>
      </div>
      <div className="sequence-grid">
        {lesson.steps.map((step, index) => {
          const active = index <= animatedStep;
          return (
            <motion.div
              key={step.id}
              className={`step-box ${active ? "active" : ""}`}
              initial={{ opacity: 0.6, y: 8 }}
              animate={{ opacity: active ? 1 : 0.58, y: 0, scale: active ? 1.02 : 1 }}
              transition={{ duration: 0.28 }}
            >
              <div className="step-label">STEP {index + 1}</div>
              <div className="step-title">{step.label}</div>
              <div className="step-detail">{step.detail}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SequenceDrawingView({ lesson, visibleStep }: { lesson: Lesson; visibleStep: number }) {
  return (
    <div className="drawing-wrap">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
            <FileChartColumn size={16} />
            参考図面風シーケンス図面ビュー
          </div>
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>{lesson.drawing.title}</div>
        </div>
        <div className="badge-wrap">
          <span className="badge">{lesson.drawing.supply}</span>
          <span className="badge">ハード設計向け表現</span>
        </div>
      </div>

      <div className="drawing-canvas">
        <div className="drawing-inner">
          <div className="drawing-header">
            <span>({String(lesson.id).padStart(3, "0")}) {lesson.drawing.leftLabel}</span>
            <span>({String(lesson.id + 40).padStart(3, "0")})</span>
          </div>
          <div className="drawing-line" style={{ marginTop: 10 }} />

          <div
            className="branch-grid"
            style={{ gridTemplateColumns: `repeat(${lesson.drawing.branches.length}, minmax(280px, 1fr))` }}
          >
            {lesson.drawing.branches.map((branch) => (
              <div className="branch-col" key={branch.label}>
                <div className="branch-rail" />
                <div className="branch-stack">
                  {branch.components.map((component, index) => {
                    const active = index <= visibleStep;
                    return (
                      <div className="component-row" key={`${branch.label}-${component.name}-${index}`}>
                        <div className="component-dot" />
                        <div className="component-link" />
                        <motion.div
                          className={`component-box ${active ? `active ${component.type}` : ""}`}
                          animate={{ scale: active ? 1.02 : 1, opacity: active ? 1 : 0.78 }}
                        >
                          <div className="component-name">{component.name}</div>
                          <div className="component-detail">{component.detail}</div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
                <div className="branch-label">{branch.label}</div>
                <div className="branch-bottom" />
              </div>
            ))}
          </div>

          <div className="drawing-line" style={{ marginTop: 8 }} />
          <div className="drawing-footer" style={{ marginTop: 10 }}>
            <span>({String(lesson.id).padStart(3, "0")}) {lesson.drawing.rightLabel}</span>
            <span>参考図面の雰囲気を意識した簡易表示</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgePanel({ lesson }: { lesson: Lesson }) {
  const audience = levels.find((item) => item.key === lesson.track)?.audience;
  return (
    <div className="card content-card">
      <div className="section-title-row">
        <BookOpen size={20} />
        <h2 className="section-title">{lesson.title}</h2>
      </div>
      <div className="section-desc">{lesson.concept}</div>

      <div className="badge-wrap" style={{ marginTop: 14 }}>
        <span className="badge">{lesson.level}</span>
        <span className="badge">対象: {audience}</span>
        <span className="badge">各レベル3題構成</span>
        <span className="badge">図面ビュー対応</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <SequenceDiagram lesson={lesson} animatedStep={lesson.steps.length - 1} />
      </div>

      <div className="point-grid">
        {lesson.points.map((point, index) => (
          <div className="point-box" key={index}>{point}</div>
        ))}
      </div>
    </div>
  );
}

function QuizPanel({ lesson, onCorrect }: { lesson: Lesson; onCorrect: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === lesson.quiz.answer;

  return (
    <div className="card content-card">
      <div className="section-title-row">
        <Lightbulb size={20} />
        <h2 className="section-title">理解チェック</h2>
      </div>
      <div className="section-desc">{lesson.quiz.question}</div>

      <div className="quiz-options">
        {lesson.quiz.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${selected === index ? "selected" : ""}`}
            onClick={() => !submitted && setSelected(index)}
          >
            {index + 1}. {option}
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button
          className="btn"
          disabled={selected === null || submitted}
          onClick={() => {
            setSubmitted(true);
            if (isCorrect) onCorrect();
          }}
        >
          採点する
        </button>
        <button className="btn secondary" onClick={() => { setSelected(null); setSubmitted(false); }}>
          リセット
        </button>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`feedback ${isCorrect ? "ok" : "ng"}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 8 }}>
            {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isCorrect ? "正解です" : "もう一度確認しましょう"}
          </div>
          <div>{lesson.quiz.explanation}</div>
        </motion.div>
      )}
    </div>
  );
}

function BasicSimulator({ lesson, speed, onSpeedChange }: { lesson: Lesson; speed: number; onSpeedChange: (value: number) => void }) {
  const [inputs, setInputs] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<{ text: string }[]>([]);
  const [latch, setLatch] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(-1);
  const [activePath, setActivePath] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<"sequence" | "drawing">("sequence");

  useEffect(() => {
    const nextInputs = Object.fromEntries(lesson.simulator.inputs.map((_, i) => [`X${i}`, false]));
    setInputs(nextInputs);
    setHistory([]);
    setLatch(false);
    setTimerTick(0);
    setAnimatedStep(-1);
    setActivePath([]);
    setIsPlaying(false);
    setViewMode("sequence");
  }, [lesson.id]);

  const result = useMemo(
    () => lesson.simulator.evaluate({ ...inputs, latch, timerTick }),
    [inputs, latch, timerTick, lesson]
  );

  useEffect(() => {
    if (!isPlaying) return;
    if (animatedStep >= activePath.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setAnimatedStep((prev) => prev + 1), speed);
    return () => window.clearTimeout(timer);
  }, [animatedStep, isPlaying, activePath, speed]);

  const playSequence = () => {
    const next = lesson.simulator.evaluate({ ...inputs, latch, timerTick });
    if (typeof next.latch === "boolean") setLatch(next.latch);
    if (typeof next.nextTimerTick === "number") setTimerTick(next.nextTimerTick);
    setActivePath(next.activeIndices ?? []);
    setAnimatedStep(-1);
    setIsPlaying(true);
    setHistory((prev) => [
      {
        text: `再生 ${prev.length + 1}: ${lesson.simulator.inputs
          .map((label, index) => `${label}=${inputs[`X${index}`] ? "ON" : "OFF"}`)
          .join(" / ")} / 出力=${next.output ? "ON" : "OFF"}`,
      },
      ...prev,
    ].slice(0, 10));
  };

  const reset = () => {
    setInputs(Object.fromEntries(lesson.simulator.inputs.map((_, i) => [`X${i}`, false])));
    setHistory([]);
    setLatch(false);
    setTimerTick(0);
    setAnimatedStep(-1);
    setActivePath([]);
    setIsPlaying(false);
  };

  const visibleStep = animatedStep >= 0 && activePath[animatedStep] !== undefined ? activePath[animatedStep] : -1;

  return (
    <div className="card content-card">
      <div className="section-title-row">
        <Cpu size={20} />
        <h2 className="section-title">動作確認シミュレータ</h2>
      </div>
      <div className="section-desc">{lesson.simulator.hint}</div>

      <div className="sim-grid" style={{ marginTop: 18 }}>
        {lesson.simulator.inputs.map((label, index) => {
          const key = `X${index}`;
          const active = !!inputs[key];
          return (
            <button
              key={key}
              className={`input-toggle ${active ? "active" : ""}`}
              onClick={() => setInputs((prev) => ({ ...prev, [key]: !prev[key] }))}
            >
              <div className="input-title">入力条件</div>
              <div className="input-name">{label}</div>
              <div className="input-state">状態: {active ? "ON" : "OFF"}</div>
            </button>
          );
        })}
      </div>

      <div className="speed-grid" style={{ marginTop: 18 }}>
        <div className="soft-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <Gauge size={16} />
            アニメーション速度
          </div>
          <div className="slider-wrap">
            <input
              className="range"
              type="range"
              min={250}
              max={1400}
              step={50}
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
            />
          </div>
          <div className="range-meta">
            <span>速い</span>
            <span>{speed} ms / step</span>
            <span>ゆっくり</span>
          </div>
        </div>

        <div className="dark-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#cbd5e1", fontSize: 14 }}>
            <Sparkles size={16} />
            再生状態
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 10 }}>{isPlaying ? "再生中" : "待機中"}</div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#cbd5e1" }}>
            到達ステップ: {Math.max(animatedStep + 1, 0)} / {Math.max(activePath.length, 1)}
          </div>
          {lesson.simulator.timer && (
            <div style={{ marginTop: 8, fontSize: 14, color: "#cbd5e1" }}>
              タイマ進行: {timerTick} / {lesson.simulator.timerTicks}
            </div>
          )}
          {lesson.simulator.latch && (
            <div style={{ marginTop: 8, fontSize: 14, color: "#cbd5e1" }}>
              保持状態: {latch ? "保持中" : "未保持"}
            </div>
          )}
        </div>
      </div>

      <div className="subtabs" style={{ marginTop: 18 }}>
        <button className={`tab-btn ${viewMode === "sequence" ? "active" : ""}`} onClick={() => setViewMode("sequence")}>シーケンス図</button>
        <button className={`tab-btn ${viewMode === "drawing" ? "active" : ""}`} onClick={() => setViewMode("drawing")}>シーケンス図面</button>
      </div>

      <div style={{ marginTop: 14 }}>
        {viewMode === "sequence" ? (
          <SequenceDiagram lesson={lesson} animatedStep={visibleStep} />
        ) : (
          <SequenceDrawingView lesson={lesson} visibleStep={visibleStep} />
        )}
      </div>

      <div className="result-grid" style={{ marginTop: 18 }}>
        <div className="soft-panel">
          <div style={{ fontSize: 12, color: "#64748b" }}>動作結果</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>{lesson.simulator.outputLabel}: {result.output ? "ON" : "OFF"}</div>
          <div style={{ marginTop: 10, lineHeight: 1.8, fontSize: 14, color: "#475569" }}>
            アニメーションでは、成立した条件が順に光り、最後に出力へ到達します。図面タブでは参考画像のような縦配線ベースの見え方で確認できます。
          </div>
        </div>
        <div className="log-box" style={{ background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <CircuitBoard size={16} />
            図面ビューの狙い
          </div>
          <div style={{ marginTop: 10, lineHeight: 1.8, fontSize: 14, color: "#475569" }}>
            実図面そのものではなく、参考図面の雰囲気に寄せた教育用の簡易図面表示です。将来的に機器記号や接点番号を部署ルールに合わせて増やしやすい構成にしています。
          </div>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 18 }}>
        <button className="btn" onClick={playSequence}><Play size={16} />アニメーション再生</button>
        <button className="btn secondary" onClick={reset}><RotateCcw size={16} />リセット</button>
      </div>

      <div className="log-box" style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 700 }}>動作ログ</div>
        {history.length === 0 ? (
          <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>まだ操作ログはありません。条件を切り替えてアニメーション再生してみてください。</div>
        ) : (
          <div className="log-stack">
            {history.map((item, index) => <div key={index} className="log-item">{item.text}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SequenceControlLearningApp() {
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<Level["key"]>("intro");
  const [speed, setSpeed] = useState(700);
  const [activeTab, setActiveTab] = useState<"learn" | "simulate" | "review">("learn");

  const filteredLessons = lessons.filter((item) => item.track === selectedTrack);
  const lesson = filteredLessons.find((item) => item.id === selectedLessonId) || filteredLessons[0];
  const progress = Math.round((completed.length / lessons.length) * 100);

  useEffect(() => {
    if (!filteredLessons.some((item) => item.id === selectedLessonId)) {
      setSelectedLessonId(filteredLessons[0]?.id ?? 1);
    }
  }, [filteredLessons, selectedLessonId]);

  const markComplete = () => {
    if (!lesson) return;
    setCompleted((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
  };

  return (
    <>
      <style>{appStyles}</style>
      <div className="app-shell">
        <div className="app-wrap">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card hero-card">
              <div className="hero-grid">
                <div>
                  <div className="badge-row">
                    <span className="badge badge-solid">インターン向け 学習アプリ</span>
                    <span className="badge">高校生〜大学生対応</span>
                    <span className="badge">ハード設計向け シーケンス図面対応</span>
                  </div>
                  <h1 className="hero-title">シーケンス制御を、レベル別に見て・動かして学べる</h1>
                  <p className="hero-desc">
                    初級・中級・上級それぞれに3題ずつ用意し、アニメーション速度調整UIと、参考図面の雰囲気に寄せたシーケンス図面ビューを追加しました。
                    シミュレータで条件を切り替えたあと、そのままシーケンス図と図面ビューを見比べながら学べます。
                  </p>
                </div>
                <div className="progress-panel">
                  <div className="progress-label"><Trophy size={16} />全体進捗</div>
                  <div className="progress-value">{progress}%</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  <div style={{ marginTop: 10, fontSize: 14, color: "#cbd5e1" }}>完了済み: {completed.length} / {lessons.length} レッスン</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="card section-card">
            <div className="section-title-row">
              <GraduationCap size={20} />
              <h2 className="section-title">学習レベルを選ぶ</h2>
            </div>
            <div className="section-desc">参加者の理解度に合わせて、初級・中級・上級を切り替えられます。各レベル3題です。</div>

            <div className="level-grid">
              {levels.map((item) => {
                const count = lessons.filter((lessonItem) => lessonItem.track === item.key).length;
                const active = selectedTrack === item.key;
                return (
                  <button key={item.key} className={`level-btn ${active ? "active" : ""}`} onClick={() => setSelectedTrack(item.key)}>
                    <div className="level-sub">{item.audience}</div>
                    <div className="level-name">{item.label}</div>
                    <div className="level-desc">{item.description}</div>
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.76 }}>題目数: {count}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="layout-grid">
            <div className="card lesson-list">
              <div className="section-title">レッスン一覧</div>
              <div className="section-desc">選んだレベルの題目を表示します。</div>
              <div className="lesson-stack">
                {filteredLessons.map((item) => {
                  const active = item.id === lesson?.id;
                  const done = completed.includes(item.id);
                  return (
                    <button key={item.id} className={`lesson-btn ${active ? "active" : ""}`} onClick={() => setSelectedLessonId(item.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                        <div>
                          <div className="lesson-sub">Lesson {item.id}</div>
                          <div className="lesson-title">{item.title}</div>
                          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.72 }}>{item.level}</div>
                        </div>
                        {done && <CheckCircle2 className="checkmark" size={18} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {lesson && (
              <div className="panel-stack">
                <div className="tabs-row">
                  <button className={`tab-btn ${activeTab === "learn" ? "active" : ""}`} onClick={() => setActiveTab("learn")}>学ぶ</button>
                  <button className={`tab-btn ${activeTab === "simulate" ? "active" : ""}`} onClick={() => setActiveTab("simulate")}>動作確認</button>
                  <button className={`tab-btn ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>レビュー用メモ</button>
                </div>

                {activeTab === "learn" && (
                  <>
                    <KnowledgePanel lesson={lesson} />
                    <QuizPanel lesson={lesson} onCorrect={markComplete} />
                  </>
                )}

                {activeTab === "simulate" && (
                  <BasicSimulator lesson={lesson} speed={speed} onSpeedChange={setSpeed} />
                )}

                {activeTab === "review" && (
                  <div className="card content-card">
                    <div className="section-title">レビュー用メモ欄</div>
                    <div className="section-desc">インターン説明時に足したい補足や、改善案をその場で残せます。</div>
                    <div className="point-box" style={{ marginTop: 16 }}>
                      例: 「図面ビューに端子番号を追加」「初級は専門用語をさらに減らす」「EMG回路を実機の記号に寄せる」「アニメーション速度の初期値を変更」
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <input className="memo-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="レビューコメントや次に追加したい内容を書く" />
                    </div>
                    <div className="memo-box" style={{ marginTop: 16 }}>
                      {note || "ここに入力した内容がレビュー用メモとして表示されます。"}
                    </div>
                    <div className="btn-row" style={{ marginTop: 16 }}>
                      <button className="btn secondary" onClick={() => setNote("")}>メモをクリア</button>
                      <button className="btn" onClick={markComplete}>このレッスンを完了にする</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

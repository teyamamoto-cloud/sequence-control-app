import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, RotateCcw, Play, Lightbulb, Cpu, BookOpen, Trophy, GraduationCap, Sparkles, Gauge, FileChartColumn, CircuitBoard } from "lucide-react";

const levels = [
  { key: "intro", label: "初級", audience: "高校生・文系向け", description: "まずは信号の流れと機器の役割をやさしく理解する" },
  { key: "basic", label: "中級", audience: "大学生向け", description: "自己保持や順序制御など、現場でよく使う考え方を学ぶ" },
  { key: "advanced", label: "上級", audience: "理系・技術志向向け", description: "安全回路やインターロックを含む実務的な見方まで踏み込む" },
];

const lessons = [
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
      evaluate: ({ X0, X1 }) => ({ output: X0 && X1, activeIndices: X0 && X1 ? [0, 1, 2, 3] : X1 ? [0, 1] : [0] }),
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
      evaluate: ({ X0, X1 }) => ({ output: X0 && X1, activeIndices: X0 && X1 ? [0, 1, 2, 3] : X1 ? [0, 1] : [0] }),
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
      evaluate: ({ X0, X1 }) => ({ output: X0 && !X1, activeIndices: X1 ? [0] : X0 ? [0, 1, 2, 3] : [0, 1] }),
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
        const nextLatch = X0 || latch;
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
      evaluate: ({ X0, X1 }) => ({ output: X0 && X1, activeIndices: X0 && X1 ? [0, 1, 2, 3] : X0 ? [0, 1] : [0] }),
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
        const ok = X0 && !X1 && X2;
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
        const emgRelay = !X0 && X1;
        const buzzer = X0 && !X2;
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
      evaluate: ({ X0, X1, X2 }) => ({ output: X0 && X1 && X2, activeIndices: X0 && X1 && X2 ? [0, 1, 2, 3] : X0 && X1 ? [0, 1, 2] : X0 ? [0, 1] : [0] }),
      hint: "異常解除だけでは不足し、復帰PBと安全OKで最後まで進む構成です。",
    },
  },
];

function getComponentColor(type, active) {
  if (!active) return "border-slate-300 bg-white text-slate-600";
  if (type === "coil" || type === "lamp") return "border-emerald-500 bg-emerald-50 text-emerald-800";
  if (type === "timer") return "border-amber-500 bg-amber-50 text-amber-800";
  return "border-sky-500 bg-sky-50 text-sky-800";
}

function SequenceDiagram({ lesson, animatedStep }) {
  return (
    <div className="rounded-3xl bg-slate-950 p-5 shadow-inner">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge className="rounded-full bg-white/10 text-white">シーケンス図</Badge>
        <Badge variant="outline" className="rounded-full border-white/20 text-slate-200">{lesson.level}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {lesson.steps.map((step, index) => {
          const active = index <= animatedStep;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.5, y: 8 }}
              animate={{ opacity: active ? 1 : 0.55, y: 0, scale: active ? 1.02 : 1 }}
              transition={{ duration: 0.35 }}
              className={`relative rounded-2xl border p-4 ${active ? "border-emerald-400 bg-emerald-400/10 text-white" : "border-white/10 bg-white/5 text-slate-300"}`}
            >
              <div className="text-xs tracking-wide opacity-70">STEP {index + 1}</div>
              <div className="mt-1 text-base font-semibold">{step.label}</div>
              <div className="mt-2 text-sm leading-6">{step.detail}</div>
              {index < lesson.steps.length - 1 && <div className="hidden xl:block absolute -right-6 top-1/2 h-0.5 w-6 bg-white/20" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SequenceDrawingView({ lesson, visibleStep }) {
  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileChartColumn className="h-4 w-4" />
            参考図面風シーケンス図面ビュー
          </div>
          <div className="mt-1 text-lg font-semibold">{lesson.drawing.title}</div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{lesson.drawing.supply}</Badge>
          <Badge variant="secondary">ハード設計向け表現</Badge>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-slate-50 p-4">
        <div className="min-w-[980px]">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>({lesson.id.toString().padStart(3, "0")}) {lesson.drawing.leftLabel}</span>
            <span>({(lesson.id + 40).toString().padStart(3, "0")})</span>
          </div>
          <div className="mt-2 h-px bg-slate-900" />

          <div className="mt-6 grid gap-6" style={{ gridTemplateColumns: `repeat(${lesson.drawing.branches.length}, minmax(280px, 1fr))` }}>
            {lesson.drawing.branches.map((branch, branchIndex) => (
              <div key={branch.label} className="relative min-h-[320px] px-4">
                <div className="absolute left-8 top-0 bottom-16 w-px bg-slate-700" />
                <div className="space-y-5 pl-2">
                  {branch.components.map((component, componentIndex) => {
                    const active = componentIndex <= visibleStep;
                    return (
                      <div key={`${branch.label}-${component.name}-${componentIndex}`} className="relative flex items-center gap-3">
                        <div className="z-10 h-3 w-3 rounded-full border-2 border-slate-700 bg-white" />
                        <div className="h-px w-8 bg-slate-700" />
                        <motion.div
                          animate={{ scale: active ? 1.02 : 1, opacity: active ? 1 : 0.75 }}
                          className={`min-w-[150px] rounded-lg border px-3 py-2 text-sm ${getComponentColor(component.type, active)}`}
                        >
                          <div className="font-semibold">{component.name}</div>
                          <div className="text-xs opacity-80">{component.detail}</div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center text-sm font-medium text-slate-700">{branch.label}</div>
                <div className="absolute bottom-6 left-8 right-8 h-px bg-slate-700" />
              </div>
            ))}
          </div>

          <div className="mt-3 h-px bg-slate-900" />
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>({lesson.id.toString().padStart(3, "0")}) {lesson.drawing.rightLabel}</span>
            <span>参考図面の雰囲気を意識した簡易表示</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgePanel({ lesson }) {
  return (
    <Card className="rounded-2xl shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>{lesson.title}</CardTitle>
        </div>
        <CardDescription>{lesson.concept}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{lesson.level}</Badge>
          <Badge variant="outline">対象: {levels.find((item) => item.key === lesson.track)?.audience}</Badge>
          <Badge variant="outline">各レベル3題構成</Badge>
          <Badge variant="outline">図面ビュー対応</Badge>
        </div>

        <SequenceDiagram lesson={lesson} animatedStep={lesson.steps.length - 1} />

        <div className="grid gap-2 md:grid-cols-3">
          {lesson.points.map((point, index) => (
            <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{point}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizPanel({ lesson, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === lesson.quiz.answer;

  return (
    <Card className="rounded-2xl shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          <CardTitle>理解チェック</CardTitle>
        </div>
        <CardDescription>{lesson.quiz.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lesson.quiz.options.map((option, index) => {
          const active = selected === index;
          return (
            <button
              key={index}
              onClick={() => !submitted && setSelected(index)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition ${active ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              {index + 1}. {option}
            </button>
          );
        })}

        <div className="flex gap-2">
          <Button onClick={() => { setSubmitted(true); if (isCorrect) onCorrect(); }} disabled={selected === null || submitted}>採点する</Button>
          <Button variant="outline" onClick={() => { setSelected(null); setSubmitted(false); }}>リセット</Button>
        </div>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 text-sm ${isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}
          >
            <div className="mb-2 flex items-center gap-2 font-medium">
              {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {isCorrect ? "正解です" : "もう一度確認しましょう"}
            </div>
            <p>{lesson.quiz.explanation}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function BasicSimulator({ lesson, speed, onSpeedChange }) {
  const [inputs, setInputs] = useState(Object.fromEntries(lesson.simulator.inputs.map((_, i) => [`X${i}`, false])));
  const [history, setHistory] = useState([]);
  const [latch, setLatch] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(-1);
  const [activePath, setActivePath] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setInputs(Object.fromEntries(lesson.simulator.inputs.map((_, i) => [`X${i}`, false])));
    setHistory([]);
    setLatch(false);
    setTimerTick(0);
    setAnimatedStep(-1);
    setActivePath([]);
    setIsPlaying(false);
  }, [lesson.id]);

  const result = useMemo(() => lesson.simulator.evaluate({ ...inputs, latch, timerTick }), [inputs, latch, timerTick, lesson]);

  useEffect(() => {
    if (!isPlaying) return;
    if (animatedStep >= activePath.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setAnimatedStep((prev) => prev + 1), speed);
    return () => clearTimeout(timer);
  }, [animatedStep, isPlaying, activePath.length, speed]);

  const playSequence = () => {
    const next = lesson.simulator.evaluate({ ...inputs, latch, timerTick });
    if (typeof next.latch === "boolean") setLatch(next.latch);
    if (typeof next.nextTimerTick === "number") setTimerTick(next.nextTimerTick);
    setActivePath(next.activeIndices ?? []);
    setAnimatedStep(-1);
    setIsPlaying(true);
    setHistory((prev) => [
      {
        text: `再生 ${prev.length + 1}: ${lesson.simulator.inputs.map((label, index) => `${label}=${inputs[`X${index}`] ? "ON" : "OFF"}`).join(" / ")} / 出力=${next.output ? "ON" : "OFF"}`,
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
    <Card className="rounded-2xl shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <CardTitle>動作確認シミュレータ</CardTitle>
        </div>
        <CardDescription>{lesson.simulator.hint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          {lesson.simulator.inputs.map((label, index) => {
            const key = `X${index}`;
            return (
              <button
                key={key}
                onClick={() => setInputs((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`rounded-2xl border p-4 text-left transition ${inputs[key] ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="text-xs opacity-70">入力条件</div>
                <div className="font-medium">{label}</div>
                <div className="mt-2 text-sm">状態: {inputs[key] ? "ON" : "OFF"}</div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Gauge className="h-4 w-4" />
              アニメーション速度
            </div>
            <div className="px-1">
              <Slider value={[speed]} min={250} max={1400} step={50} onValueChange={(value) => onSpeedChange(value[0])} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>速い</span>
              <span>{speed} ms / step</span>
              <span>ゆっくり</span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4" />
              再生状態
            </div>
            <div className="mt-3 text-2xl font-bold">{isPlaying ? "再生中" : "待機中"}</div>
            <div className="mt-2 text-sm text-slate-300">到達ステップ: {Math.max(animatedStep + 1, 0)} / {Math.max(activePath.length, 1)}</div>
            {lesson.simulator.timer && <div className="mt-2 text-sm text-slate-300">タイマ進行: {timerTick} / {lesson.simulator.timerTicks}</div>}
            {lesson.simulator.latch && <div className="mt-2 text-sm text-slate-300">保持状態: {latch ? "保持中" : "未保持"}</div>}
          </div>
        </div>

        <Tabs defaultValue="sequence" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl">
            <TabsTrigger value="sequence">シーケンス図</TabsTrigger>
            <TabsTrigger value="drawing">シーケンス図面</TabsTrigger>
          </TabsList>
          <TabsContent value="sequence">
            <SequenceDiagram lesson={lesson} animatedStep={visibleStep} />
          </TabsContent>
          <TabsContent value="drawing">
            <SequenceDrawingView lesson={lesson} visibleStep={visibleStep} />
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">動作結果</div>
            <div className="mt-2 text-lg font-semibold">{lesson.simulator.outputLabel}: {result.output ? "ON" : "OFF"}</div>
            <div className="mt-3 text-sm text-slate-600">アニメーションでは、成立した条件が順に光り、最後に出力へ到達します。図面タブでは参考画像のような縦配線ベースの見え方で確認できます。</div>
          </div>
          <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-600">
            <div className="mb-2 flex items-center gap-2 font-medium text-slate-800">
              <CircuitBoard className="h-4 w-4" />
              図面ビューの狙い
            </div>
            実図面そのものではなく、参考図面の雰囲気に寄せた教育用の簡易図面表示です。将来的に機器記号や接点番号を部署ルールに合わせて増やしやすい構成にしています。
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={playSequence}><Play className="mr-2 h-4 w-4" />アニメーション再生</Button>
          <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />リセット</Button>
        </div>

        <div className="rounded-2xl border border-dashed p-4">
          <div className="mb-2 text-sm font-medium">動作ログ</div>
          {history.length === 0 ? (
            <div className="text-sm text-slate-500">まだ操作ログはありません。条件を切り替えてアニメーション再生してみてください。</div>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              {history.map((item, index) => <div key={index} className="rounded-xl bg-slate-50 p-2">{item.text}</div>)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SequenceControlLearningApp() {
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [note, setNote] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("intro");
  const [speed, setSpeed] = useState(700);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[28px] border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-center">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className="rounded-full">インターン向け 学習アプリ</Badge>
                    <Badge variant="outline" className="rounded-full">高校生〜大学生対応</Badge>
                    <Badge variant="outline" className="rounded-full">ハード設計向け シーケンス図面対応</Badge>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">シーケンス制御を、レベル別に見て・動かして学べる</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    初級・中級・上級それぞれに3題ずつ用意し、アニメーション速度調整UIと、参考図面の雰囲気に寄せたシーケンス図面ビューを追加しました。
                    シミュレータで条件を切り替えたあと、そのままシーケンス図と図面ビューを見比べながら学べます。
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-950 p-5 text-white shadow-inner">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Trophy className="h-4 w-4" />
                    全体進捗
                  </div>
                  <div className="mt-3 text-3xl font-bold">{progress}%</div>
                  <div className="mt-3"><Progress value={progress} /></div>
                  <div className="mt-3 text-sm text-slate-300">完了済み: {completed.length} / {lessons.length} レッスン</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <CardTitle>学習レベルを選ぶ</CardTitle>
            </div>
            <CardDescription>参加者の理解度に合わせて、初級・中級・上級を切り替えられます。各レベル3題です。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {levels.map((item) => {
              const active = item.key === selectedTrack;
              const count = lessons.filter((lessonItem) => lessonItem.track === item.key).length;
              return (
                <button
                  key={item.key}
                  onClick={() => setSelectedTrack(item.key)}
                  className={`rounded-2xl border p-4 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div className="text-xs opacity-70">{item.audience}</div>
                  <div className="mt-1 text-lg font-semibold">{item.label}</div>
                  <div className={`mt-2 text-sm leading-6 ${active ? "text-slate-300" : "text-slate-600"}`}>{item.description}</div>
                  <div className={`mt-3 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>題目数: {count}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card className="rounded-2xl border-0 shadow-lg h-fit">
            <CardHeader>
              <CardTitle>レッスン一覧</CardTitle>
              <CardDescription>選んだレベルの題目を表示します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredLessons.map((item) => {
                const done = completed.includes(item.id);
                const active = item.id === lesson?.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLessonId(item.id)}
                    className={`w-full rounded-2xl p-4 text-left transition ${active ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 hover:bg-slate-100"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs opacity-70">Lesson {item.id}</div>
                        <div className="font-semibold">{item.title}</div>
                        <div className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{item.level}</div>
                      </div>
                      {done && <CheckCircle2 className="h-5 w-5" />}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {lesson && (
            <Tabs defaultValue="learn" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                <TabsTrigger value="learn">学ぶ</TabsTrigger>
                <TabsTrigger value="simulate">動作確認</TabsTrigger>
                <TabsTrigger value="review">レビュー用メモ</TabsTrigger>
              </TabsList>

              <TabsContent value="learn" className="space-y-4">
                <KnowledgePanel lesson={lesson} />
                <QuizPanel lesson={lesson} onCorrect={markComplete} />
              </TabsContent>

              <TabsContent value="simulate">
                <BasicSimulator lesson={lesson} speed={speed} onSpeedChange={setSpeed} />
              </TabsContent>

              <TabsContent value="review">
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>レビュー用メモ欄</CardTitle>
                    <CardDescription>インターン説明時に足したい補足や、改善案をその場で残せます。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      例: 「図面ビューに端子番号を追加」「初級は専門用語をさらに減らす」「EMG回路を実機の記号に寄せる」「アニメーション速度の初期値を変更」
                    </div>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="レビューコメントや次に追加したい内容を書く" className="h-12 rounded-xl" />
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-600 min-h-[180px] whitespace-pre-wrap">
                      {note || "ここに入力した内容がレビュー用メモとして表示されます。"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setNote("")}>メモをクリア</Button>
                      <Button onClick={markComplete}>このレッスンを完了にする</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

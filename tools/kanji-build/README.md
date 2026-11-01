# かんじデータの つくりかた

kanji-data.js は このフォルダの スクリプトで 生成しています(アプリの 実行には 不要)。

- 元データ: KanjiVG(CC BY-SA 3.0)、jamdict-data に入っている KANJIDIC2・JMdict(CC BY-SA 4.0)
- 学年: 1〜3年は KANJIDIC2、4〜6年は 2020年度の 配当表(grades_456.txt)
- step1 → step2 → step3 → step4 → step5 の順に実行、verify.py で 全問題の 答えと 別解を チェック
- 辞書で 部首が 分かれる 字(当 歯 申 由 全 巣 準 才 承 着 厳 営 単 内 巻 争 舎 率)は 部首の 問題から 除外

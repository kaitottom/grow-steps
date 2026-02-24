export const analyzeEntry = (_entry: any) => {
    // Simple placeholder feedback at entry time (basic, no AI shown to user now)
    return '';
};

export const analyzeReflection = (_entry: any, reflection: { learnings: string; feelings: string; nextSteps: string }) => {
    const { learnings, feelings, nextSteps } = reflection;

    const feedbackTemplates = [
        `「${learnings}」という気づきは非常に価値があります。「${feelings}」という感情は成長の証です。次のステップ「${nextSteps}」を実行することで、さらなる飛躍が期待できます。`,
        `「${learnings}」という学びを得られたこと自体が大きな前進です。感情面では「${feelings}」と感じているとのこと、そのリアルな手応えを次回の計画「${nextSteps}」に活かしましょう。`,
        `あなたの振り返りから一つ核心を言うと：「${learnings}」という洞察は、まさに成長の本質です。「${nextSteps}」という次の一手を、迷わず実行してください。`,
        `「${feelings}」という感想は正直で良いですね。「${learnings}」という学びを武器に、次の行動「${nextSteps}」に向けて、また最速最小の一歩を踏み出しましょう。`,
    ];

    const template = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
    return template;
};

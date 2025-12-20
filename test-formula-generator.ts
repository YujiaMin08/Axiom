/**
 * 公式生成器测试脚本
 */

import { generateFormulaContent } from './server/gemini-formula-generator';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

/**
 * 测试勾股定理
 */
async function testPythagoreanTheorem() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '📐 勾股定理公式生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const result = await generateFormulaContent(
    'Pythagorean Theorem',
    'SCIENCE',
    {
      type: 'formula',
      title: 'The Pythagorean Identity',
      description: 'The fundamental relationship between the sides of a right triangle'
    },
    {
      derivation_level: 'detailed',
      target_audience: 'G7-G9'
    }
  );

  displayFormula(result);

  const fs = require('fs');
  fs.writeFileSync('./pythagorean-formula.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: pythagorean-formula.json' + colors.reset);
}

/**
 * 测试光合作用化学方程
 */
async function testPhotosynthesisEquation() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🌿 光合作用化学方程生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const result = await generateFormulaContent(
    'photosynthesis',
    'SCIENCE',
    {
      type: 'formula',
      title: 'The Photosynthesis Equation',
      description: 'Chemical equation showing how plants convert light energy into chemical energy'
    },
    {
      derivation_level: 'simple',
      target_audience: 'G7-G10'
    }
  );

  displayFormula(result);

  const fs = require('fs');
  fs.writeFileSync('./photosynthesis-formula.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: photosynthesis-formula.json' + colors.reset);
}

/**
 * 测试二次方程求根公式
 */
async function testQuadraticFormula() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '📊 二次方程求根公式生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const result = await generateFormulaContent(
    'quadratic equation',
    'SCIENCE',
    {
      type: 'formula',
      title: 'The Quadratic Formula',
      description: 'Deriving the formula for solving ax² + bx + c = 0'
    },
    {
      derivation_level: 'rigorous',
      include_proof: true,
      target_audience: 'G9-G12'
    }
  );

  displayFormula(result);

  const fs = require('fs');
  fs.writeFileSync('./quadratic-formula.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: quadratic-formula.json' + colors.reset);
}

/**
 * 显示公式内容
 */
function displayFormula(formula: any) {
  console.log(colors.bright + '📐 ' + formula.title + colors.reset);
  console.log(colors.yellow + `难度: ${formula.difficulty_level}` + colors.reset);
  console.log();

  console.log(colors.bright + '🔢 主公式:' + colors.reset);
  console.log(colors.cyan + `  ${formula.main_formula}` + colors.reset);
  console.log();

  console.log(colors.bright + '💡 公式含义:' + colors.reset);
  console.log(colors.gray + formula.formula_explanation + colors.reset);
  console.log();

  console.log(colors.bright + '📋 符号表:' + colors.reset);
  formula.symbol_table.forEach((sym: any) => {
    const unit = sym.unit ? ` (${sym.unit})` : '';
    console.log(`  ${colors.cyan}${sym.symbol}${colors.reset}: ${sym.meaning}${unit}`);
  });
  console.log();

  if (formula.derivation_steps && formula.derivation_steps.length > 0) {
    console.log(colors.bright + `🔍 推导步骤 (${formula.derivation_steps.length}步):` + colors.reset);
    formula.derivation_steps.forEach((step: any) => {
      console.log(`  ${colors.yellow}步骤 ${step.step_number}${colors.reset}: ${step.description}`);
      console.log(`  ${colors.cyan}${step.formula}${colors.reset}`);
      if (step.explanation) {
        console.log(`  ${colors.gray}→ ${step.explanation}${colors.reset}`);
      }
      console.log();
    });
  }

  console.log(colors.bright + '💡 关键洞察:' + colors.reset);
  formula.key_insights.forEach((insight: string, idx: number) => {
    console.log(`  ${idx + 1}. ${insight}`);
  });
  console.log();

  if (formula.example_application) {
    console.log(colors.bright + '📝 应用示例:' + colors.reset);
    console.log(colors.gray + formula.example_application.scenario + colors.reset);
    console.log();
    console.log('  已知条件:');
    console.log(`    ${formula.example_application.given_values}`);
    console.log();
    console.log('  求解步骤:');
    formula.example_application.solution_steps.forEach((step: string, idx: number) => {
      console.log(`    ${idx + 1}. ${step}`);
    });
    console.log();
    console.log(colors.green + `  答案: ${formula.example_application.final_answer}` + colors.reset);
  }

  console.log(colors.green + '\n✅ 公式生成成功！' + colors.reset);
}

// 主函数
async function main() {
  console.log(colors.bright + colors.magenta);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom 公式生成器测试工具                              ║
  ║         Testing Gemini 2.5 Flash Formula Generation          ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'pythagorean';

  if (mode === 'photosynthesis') {
    await testPhotosynthesisEquation();
  } else if (mode === 'quadratic') {
    await testQuadraticFormula();
  } else {
    await testPythagoreanTheorem();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


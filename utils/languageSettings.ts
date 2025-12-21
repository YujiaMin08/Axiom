/**
 * 语言设置工具
 * 管理用户的语言偏好
 */

export type Language = 'en' | 'zh';

export const getLanguagePreference = (): Language => {
  return (localStorage.getItem('axiom_language') as Language) || 'en';
};

export const setLanguagePreference = (lang: Language) => {
  localStorage.setItem('axiom_language', lang);
};

/**
 * 根据领域和用户设置获取内容生成语言
 * @param domain - 学习领域
 * @returns 内容生成使用的语言
 */
export const getContentLanguage = (domain: string): Language => {
  const userLang = getLanguagePreference();
  
  // Language Arts 始终中英文双语，不受设置影响
  if (domain === 'LANGUAGE') {
    return 'zh'; // 返回 zh 表示需要双语
  }
  
  // Science 和 Liberal Arts 根据用户设置
  return userLang;
};


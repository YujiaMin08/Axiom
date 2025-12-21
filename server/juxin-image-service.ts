/**
 * JUXIN 图片生成服务 (Gemini 3 Pro Image Preview)
 * 
 * 功能：
 * - 调用 JUXIN API 使用 gemini-3-pro-image-preview 模型生成图片
 * - 支持控制宽高比（aspectRatio）和清晰度（imageSize）
 * - 支持图片编辑（基于输入图片生成新图片）
 * 
 * 模型特点：
 * - 模型：gemini-3-pro-image-preview (Nano Banana)
 * - 升级版 Gemini 2.5 Flash Image
 * - 支持 2K/4K 分辨率输出
 * - 支持文字渲染、物理推理等
 */

const JUXIN_BASE_URL = 'https://api.jxincm.cn';
const JUXIN_API_KEY = process.env.JUXIN_API_KEY || 'sk-eMBQokcDGcuksgbrkbOST9GPMFVAUssxA6Rt5qRn4isUVTwM';

// ============ 类型定义 ============

/**
 * 图片生成参数
 */
export interface ImageGenerateParams {
  prompt: string;                    // 文本提示词
  aspectRatio?: string;              // 宽高比：'1:1' | '4:3' | '16:9' | '9:16' 等
  imageSize?: '2K';                  // 清晰度：仅支持 2K
  baseImage?: {                      // 可选：基础图片（用于图片编辑）
    mimeType: string;                // 如 'image/jpeg', 'image/png'
    data: string;                    // Base64 编码的图片数据
  };
}

/**
 * 图片生成响应
 */
export interface ImageGenerateResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inline_data?: {
          mime_type: string;
          data: string;              // Base64 编码的图片数据
        };
      }>;
      role: string;
    };
    finishReason: string;
    avgLogprobs: number;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion: string;
}

/**
 * 简化的图片结果
 */
export interface ImageResult {
  success: boolean;
  imageData?: string;                // Base64 图片数据
  imageUrl?: string;                 // 如果API返回URL
  text?: string;                     // AI返回的文本说明
  mimeType?: string;                 // 图片MIME类型
  error?: string;
}

// ============ 核心函数 ============

/**
 * 生成图片
 */
export async function generateImage(params: ImageGenerateParams): Promise<ImageResult> {
  const {
    prompt,
    aspectRatio = '16:9',
    imageSize = '2K',
    baseImage
  } = params;

  // 构建请求体
  const parts: any[] = [{ text: prompt }];
  
  // 如果提供了基础图片，添加到请求中（用于图片编辑）
  if (baseImage) {
    parts.push({
      inline_data: {
        mime_type: baseImage.mimeType,
        data: baseImage.data
      }
    });
  }

  const requestBody = {
    contents: [{
      parts
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio,
        imageSize
      }
    }
  };

  try {
    console.log('📸 调用 JUXIN 图片生成 API...');
    console.log('提示词:', prompt);
    console.log('宽高比:', aspectRatio);
    console.log('清晰度:', imageSize);
    if (baseImage) {
      console.log('基础图片: 提供（用于编辑）');
    }

    const response = await fetch(
      `${JUXIN_BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${JUXIN_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`图片生成失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data: ImageGenerateResponse = await response.json();
    
    // 解析响应
    if (!data.candidates || data.candidates.length === 0) {
      return {
        success: false,
        error: '未返回图片结果'
      };
    }

    const candidate = data.candidates[0];
    const parts = candidate.content.parts;

    // 提取图片数据和文本
    let imageData: string | undefined;
    let text: string | undefined;
    let mimeType: string | undefined;

    for (const part of parts) {
      // 检查 inline_data (驼峰) 和 inlineData (camelCase)
      const inlineData = (part as any).inline_data || (part as any).inlineData;
      if (inlineData) {
        imageData = inlineData.data;
        mimeType = inlineData.mime_type || inlineData.mimeType;
      }
      if ((part as any).text) {
        text = (part as any).text;
      }
    }

    if (!imageData) {
      return {
        success: false,
        error: '响应中未找到图片数据'
      };
    }

    console.log('✅ 图片生成成功！');
    console.log('图片大小:', Math.round(imageData.length / 1024), 'KB');
    if (text) {
      console.log('AI 说明:', text);
    }

    return {
      success: true,
      imageData,
      mimeType: mimeType || 'image/jpeg',
      text
    };

  } catch (error: any) {
    console.error('❌ 图片生成失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 将Base64图片数据保存为文件
 */
export function saveImageToFile(imageData: string, filename: string): void {
  const fs = require('fs');
  const buffer = Buffer.from(imageData, 'base64');
  fs.writeFileSync(filename, buffer);
  console.log(`💾 图片已保存: ${filename}`);
}

/**
 * 将Base64图片数据转换为Data URL（可直接在HTML中使用）
 */
export function imageDataToDataURL(imageData: string, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${imageData}`;
}


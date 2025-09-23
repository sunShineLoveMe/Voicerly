# VoxCPM API 接口文档

## 概述
VoxCPM 是一个端到端的文本转语音(TTS)模型，提供高质量的语音合成功能。本文档详细描述了项目中可用的 API 接口及其功能。

## 基础信息
- **服务地址**: `http://localhost:7860`
- **API 访问地址**: `http://localhost:7860/?view=api`
- **框架**: Gradio
- **设备支持**: CUDA/CPU 自动检测
- **API 端点总数**: 2个

## 安装依赖
使用 Gradio 客户端需要先安装依赖：
```bash
pip install gradio_client
```

## API 接口列表

### 1. 语音合成接口 (主要功能)
**接口名称**: `/generate`  
**API名称**: `generate`  
**功能**: 根据输入文本生成高质量的语音音频，支持音色克隆和风格控制

#### 请求参数 (共7个参数)
| 参数位置 | 参数名 | 类型 | 必填 | 默认值 | 描述 |
|---------|--------|------|------|--------|------|
| 0 | `text_input` | str | 是 | "VoxCPM is an innovative end-to-end TTS model from ModelBest, designed to generate highly realistic speech." | 目标文本 - 在"Target Text"文本框中提供的输入值 |
| 1 | `prompt_wav_path_input` | filepath | 否 | handle_file('https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav') | 参考音频文件 - 在"Prompt Speech"音频组件中提供的输入值 |
| 2 | `prompt_text_input` | str | 否 | "Just by listening a few minutes a day, you'll be able to eliminate negative thoughts by conditioning your mind to be more positive." | 参考文本 - 在"Prompt Text"文本框中提供的输入值 |
| 3 | `cfg_value_input` | float | 否 | 2 | CFG引导比例 - 在"CFG Value (Guidance Scale)"滑块组件中提供的输入值 |
| 4 | `inference_timesteps_input` | float | 否 | 10 | 推理时间步数 - 在"Inference Timesteps"滑块组件中提供的输入值 |
| 5 | `do_normalize` | bool | 否 | False | 文本正则化 - 在"Text Normalization"复选框组件中提供的输入值 |
| 6 | `denoise` | bool | 否 | False | 音频降噪 - 在"Prompt Speech Enhancement"复选框组件中提供的输入值 |

#### 返回值
| 字段名 | 类型 | 描述 |
|--------|------|------|
| `filepath` | filepath | 生成的音频文件路径 - 出现在"Output Audio"音频组件中的输出值 |

#### Python 调用示例
```python
from gradio_client import Client, handle_file

client = Client("http://localhost:7860/")
result = client.predict(
    text_input="VoxCPM is an innovative end-to-end TTS model from ModelBest, designed to generate highly realistic speech.",
    prompt_wav_path_input=handle_file('https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav'),
    prompt_text_input="Just by listening a few minutes a day, you'll be able to eliminate negative thoughts by conditioning your mind to be more positive.",
    cfg_value_input=2,
    inference_timesteps_input=10,
    do_normalize=False,
    denoise=False,
    api_name="/generate"
)
print(result)
```

---

### 2. 语音识别接口
**接口名称**: `/prompt_wav_recognition`  
**API名称**: `prompt_wav_recognition`  
**功能**: 识别上传的音频文件并返回识别的文本内容

#### 请求参数 (共1个参数)
| 参数位置 | 参数名 | 类型 | 必填 | 默认值 | 描述 |
|---------|--------|------|------|--------|------|
| 0 | `prompt_wav` | filepath | 否 | handle_file('https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav') | 音频文件 - 在"Prompt Speech"音频组件中提供的输入值 |

#### 返回值
| 字段名 | 类型 | 描述 |
|--------|------|------|
| `str` | str | 识别出的文本内容 - 出现在"Prompt Text"文本框组件中的输出值 |

#### Python 调用示例
```python
from gradio_client import Client, handle_file

client = Client("http://localhost:7860/")
result = client.predict(
    prompt_wav=handle_file('https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav'),
    api_name="/prompt_wav_recognition"
)
print(result)
```

## 参数详细说明

### CFG Value (引导比例)
- **范围**: 1.0 - 3.0 (通过滑块控制)
- **默认值**: 2.0
- **作用**: 
  - 较低值 (1.0-1.5): 允许更多创造性，音色可能与参考音频差异较大
  - 较高值 (2.5-3.0): 更严格遵循参考音频的音色特征
- **UI组件**: "CFG Value (Guidance Scale)" 滑块

### Inference Timesteps (推理时间步)
- **范围**: 4 - 30 (通过滑块控制)
- **默认值**: 10
- **作用**:
  - 较低值 (4-8): 生成速度快，但质量可能略低
  - 较高值 (15-30): 生成质量高，但速度较慢
- **UI组件**: "Inference Timesteps" 滑块

### Text Normalization (文本正则化)
- **默认值**: False
- **启用**: 使用 WeTextProcessing 组件处理常见文本格式
- **禁用**: 使用 VoxCPM 内置文本理解，支持音素输入等高级功能
- **UI组件**: "Text Normalization" 复选框

### Prompt Speech Enhancement (参考音频增强)
- **默认值**: False
- **启用**: 使用 ZipEnhancer 模型对参考音频进行降噪处理
- **禁用**: 保留原始音频的背景环境特征
- **UI组件**: "Prompt Speech Enhancement" 复选框

## JavaScript 调用示例

### 语音合成 (基础)
```javascript
import { Client } from "@gradio/client";

const client = await Client.connect("http://localhost:7860/");
const result = await client.predict("/generate", {
    text_input: "Hello, this is a test message.",
    prompt_wav_path_input: null,
    prompt_text_input: null,
    cfg_value_input: 2.0,
    inference_timesteps_input: 10,
    do_normalize: false,
    denoise: false
});

console.log(result.data);
```

### 语音合成 (带音色克隆)
```javascript
import { Client } from "@gradio/client";

const client = await Client.connect("http://localhost:7860/");
const result = await client.predict("/generate", {
    text_input: "你好，这是一个测试消息。",
    prompt_wav_path_input: "path/to/reference_audio.wav",
    prompt_text_input: "参考音频的文本内容",
    cfg_value_input: 2.5,
    inference_timesteps_input: 15,
    do_normalize: true,
    denoise: true
});

console.log(result.data);
```

### 语音识别
```javascript
import { Client } from "@gradio/client";

const client = await Client.connect("http://localhost:7860/");
const result = await client.predict("/prompt_wav_recognition", {
    prompt_wav: "path/to/audio.wav"
});

console.log(result.data);
```

## Bash 调用示例

### 使用 curl (需要构造适当的multipart数据)
```bash
# 注意：Gradio API 通常需要特殊的数据格式，建议使用 Python 或 JavaScript 客户端
# 以下仅为参考格式

# 语音合成
curl -X POST "http://localhost:7860/api/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "data": [
         "Hello, this is a test message.",
         null,
         null,
         2.0,
         10,
         false,
         false
       ],
       "fn_index": 0
     }'
```

## 模型信息

### ASR 模型 (用于语音识别)
- **模型**: iic/SenseVoiceSmall
- **功能**: 自动语音识别，将音频转换为文本
- **支持**: 多语言自动检测、文本规范化
- **用途**: 在 `/prompt_wav_recognition` 接口中使用

### TTS 模型 (用于语音合成)
- **模型**: VoxCPM-0.5B (基于 MiniCPM-4)
- **功能**: 端到端语音合成
- **特性**: 音色克隆、多语言支持、高质量合成、上下文感知
- **用途**: 在 `/generate` 接口中使用

### 辅助模型
- **ZipEnhancer**: 音频增强模型，用于降噪处理
- **WeTextProcessing**: 文本正则化处理组件

## 使用建议

### 最佳实践
1. **参考音频质量**: 使用清晰、无背景噪音的音频作为参考
2. **文本长度**: 建议单次合成文本长度不超过 200 字符
3. **参数调优**: 
   - 音色要求高: CFG Value 设置为 2.5-3.0
   - 速度要求高: Inference Timesteps 设置为 6-8
   - 质量要求高: Inference Timesteps 设置为 15-20
4. **文件处理**: 使用 `handle_file()` 函数处理本地文件或URL

### 性能优化
- **GPU 加速**: 自动检测并使用 CUDA (如果可用)
- **内存管理**: 模型采用懒加载机制，首次调用时初始化
- **并发处理**: 支持队列机制，最大并发数为 10
- **客户端**: 推荐使用 `gradio_client` 而非直接 HTTP 请求

## 文件格式支持

### 音频文件
- **输入格式**: WAV, MP3, FLAC, OGG 等常见音频格式
- **输出格式**: WAV (16kHz 采样率)
- **文件处理**: 通过 `handle_file()` 函数上传本地文件或远程URL

### 示例文件路径处理
```python
from gradio_client import handle_file

# 本地文件
audio_file = handle_file('/path/to/local/audio.wav')

# 远程URL
audio_file = handle_file('https://example.com/audio.wav')

# 使用在API调用中
result = client.predict(
    prompt_wav=audio_file,
    api_name="/prompt_wav_recognition"
)
```

## 错误处理

### 常见错误
1. **空文本输入**: 返回 "Please input text to synthesize." 错误
2. **模型加载失败**: 检查模型文件是否存在
3. **音频文件格式不支持**: 确保音频文件格式正确
4. **网络连接错误**: 检查服务是否在 `localhost:7860` 运行
5. **参数类型错误**: 确保参数类型与API规范一致

### 调试建议
- 使用 Python 客户端进行调试，比直接 HTTP 请求更可靠
- 检查服务器日志获取详细错误信息
- 验证音频文件是否能正常播放

## 环境要求

### 客户端依赖
```bash
# Python 客户端
pip install gradio_client

# JavaScript 客户端  
npm install @gradio/client
```

### 服务端要求
- **Python**: 3.8+
- **PyTorch**: 支持 CUDA (推荐)
- **Gradio**: 用于Web界面和API服务
- **其他依赖**: FunASR, VoxCPM, SenseVoice

### 硬件要求
- **最低配置**: CPU + 8GB RAM
- **推荐配置**: GPU + 16GB VRAM  
- **存储空间**: 至少 10GB (用于模型文件)

## 更新日志
- **v0.5B**: 初始版本发布
- 支持音色克隆和多语言合成
- 集成 SenseVoice 语音识别功能
- 提供 Gradio API 接口

---

*注意: 本文档基于实际 Gradio API 规范编写，适用于 VoxCPM-0.5B 版本。如有更新请及时查看最新版本文档。*

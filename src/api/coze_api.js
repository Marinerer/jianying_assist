import { Args } from '@/runtime';
import { Input, Output } from "@/typings/create_task_list/create_task_list";
import axios from 'axios';

/**
  * Each file needs to export a function named `handler`. This function is the entrance to the Tool.
  * @param {Object} args.input - input parameters, you can get test input value by input.xxx.
  * @param {Object} args.logger - logger instance used to print logs, injected by runtime
  * @returns {*} The return data of the function, which should match the declared output parameters.
  * 
  * Remember to fill in input/output in Metadata, it helps LLM to recognize and use tool.
  */
export async function handler({ input, logger }: Args<Input>): Promise<Output> {
  try {
    const response = await axios.post('http://hailuo.st-ai.top/video_tasks_create', {
      prompt: input.prompt,
      image_url: input.image_url
    }, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.token}` // 使用 token 作为 Bearer token
      }
    });

    // 处理响应数据
    const data = response.data;
    logger.info('API response:', data);

    return {
      message: "API call successful",
      // 你可以根据需要返回更多数据
    };
  } catch (error) {
    logger.error('API call failed:', error);
    return {
      message: "API call failed",
    };
  }
};
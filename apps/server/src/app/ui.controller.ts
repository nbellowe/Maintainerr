import { Controller, Get, Req, Res } from '@nestjs/common';
import { readFileSync } from 'fs';
import type { Request, Response } from 'express';
import { join } from 'path';
import { normalizeBasePath } from './basePath';

const BASE_PATH_PLACEHOLDER = '__MAINTAINERR_BASE_PATH__';
const UI_INDEX_PATH = join(__dirname, '..', 'ui', 'index.html');

let cachedUiIndexTemplate: string | undefined;

const getRequestPath = (requestPath: string, basePath: string) => {
  if (!basePath) {
    return requestPath;
  }

  if (requestPath === basePath) {
    return '/';
  }

  if (requestPath.startsWith(`${basePath}/`)) {
    return requestPath.slice(basePath.length) || '/';
  }

  return requestPath;
};

const loadUiIndexTemplate = () => {
  if (cachedUiIndexTemplate !== undefined) {
    return cachedUiIndexTemplate;
  }

  cachedUiIndexTemplate = readFileSync(UI_INDEX_PATH, 'utf8');

  return cachedUiIndexTemplate;
};

const isMissingFileError = (error: unknown): error is NodeJS.ErrnoException => {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
};

@Controller()
export class UiController {
  static resetIndexTemplateCache() {
    cachedUiIndexTemplate = undefined;
  }

  @Get(['', '{*path}'])
  getIndex(@Req() request: Request, @Res() response: Response) {
    if (process.env.NODE_ENV !== 'production') {
      response.status(404).send('Not Found');
      return;
    }

    const basePath = normalizeBasePath(process.env.BASE_PATH) ?? '';
    const requestPath = getRequestPath(request.path, basePath);
    const acceptsHtml = Boolean(request.accepts('html'));

    if (
      requestPath === '/api' ||
      requestPath.startsWith('/api/') ||
      requestPath.includes('.') ||
      !acceptsHtml
    ) {
      response.status(404).send('Not Found');
      return;
    }

    let template: string;

    try {
      template = loadUiIndexTemplate();
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw error;
      }

      response.status(404).send('Not Found');
      return;
    }

    const html = template.split(BASE_PATH_PLACEHOLDER).join(basePath);

    response.type('html').send(html);
  }
}
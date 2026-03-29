jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

import { readFileSync } from 'fs';
import type { Request, Response } from 'express';
import { UiController } from './ui.controller';

describe('UiController', () => {
  const envBackup = { ...process.env };

  let controller: UiController;
  let response: Response;

  const mockedReadFileSync = jest.mocked(readFileSync);

  const createRequest = (
    path: string,
    acceptsHtml: string | false = 'html',
  ): Request =>
    ({
      path,
      accepts: jest.fn().mockReturnValue(acceptsHtml),
    }) as unknown as Request;

  beforeEach(() => {
    process.env = { ...envBackup };
    controller = new UiController();
    UiController.resetIndexTemplateCache();
    mockedReadFileSync.mockReset();

    response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      type: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('returns the SPA index with the normalized runtime base path in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.BASE_PATH = '/maintainerr/';
    mockedReadFileSync.mockReturnValue(
      '<script>__MAINTAINERR_BASE_PATH__</script>',
    );

    controller.getIndex(createRequest('/maintainerr/rules'), response);

    expect(response.type).toHaveBeenCalledWith('html');
    expect(response.send).toHaveBeenCalledWith('<script>/maintainerr</script>');
  });

  it('caches the UI index template after the first successful read', () => {
    process.env.NODE_ENV = 'production';
    mockedReadFileSync.mockReturnValue(
      '<script>__MAINTAINERR_BASE_PATH__</script>',
    );

    controller.getIndex(createRequest('/rules'), response);
    controller.getIndex(createRequest('/collections'), response);

    expect(mockedReadFileSync).toHaveBeenCalledTimes(1);
    expect(response.type).toHaveBeenCalledTimes(2);
  });

  it('returns 404 for API requests', () => {
    process.env.NODE_ENV = 'production';
    process.env.BASE_PATH = '/maintainerr';

    controller.getIndex(createRequest('/maintainerr/api/app/status'), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith('Not Found');
    expect(mockedReadFileSync).not.toHaveBeenCalled();
  });

  it('returns 404 for asset requests', () => {
    process.env.NODE_ENV = 'production';

    controller.getIndex(createRequest('/assets/index.js'), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith('Not Found');
    expect(mockedReadFileSync).not.toHaveBeenCalled();
  });

  it('returns 404 outside production mode', () => {
    process.env.NODE_ENV = 'development';

    controller.getIndex(createRequest('/rules'), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith('Not Found');
    expect(mockedReadFileSync).not.toHaveBeenCalled();
  });

  it('returns 404 when the browser does not accept html', () => {
    process.env.NODE_ENV = 'production';

    controller.getIndex(createRequest('/rules', false), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith('Not Found');
    expect(mockedReadFileSync).not.toHaveBeenCalled();
  });

  it('returns 404 when the UI index file is missing', () => {
    process.env.NODE_ENV = 'production';
    mockedReadFileSync.mockImplementation(() => {
      const error = new Error('missing index.html') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      throw error;
    });

    controller.getIndex(createRequest('/rules'), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith('Not Found');
  });
});
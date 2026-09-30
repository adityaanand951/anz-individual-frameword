import { expect, type APIRequestContext } from '@playwright/test';

export class ApiPage {
  private readonly baseUrl = 'http://jsonplaceholder.typicode.com';
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createPost(title: string, body: string) {
    return this.request.post(`${this.baseUrl}/posts`, {
      data: {
        title,
        body,
        userId: 1
      }
    });
  }

  async getPost(postId: number) {
    return this.request.get(`${this.baseUrl}/posts/${postId}`);
  }

  async updatePost(postId: number, title: string, body: string) {
    return this.request.put(`${this.baseUrl}/posts/${postId}`, {
      data: {
        id: postId,
        title,
        body,
        userId: 1
      }
    });
  }

  async deletePost(postId: number) {
    return this.request.delete(`${this.baseUrl}/posts/${postId}`);
  }

  async expectStatus(response: any, expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
  }

  async expectTitle(response: any, expectedTitle: string) {
    const payload = await response.json();
    expect(payload.title).toBe(expectedTitle);
  }

  async expectId(response: any, expectedId: number) {
    const payload = await response.json();
    expect(payload.id).toBe(expectedId);
  }
}

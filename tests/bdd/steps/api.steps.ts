import { Given, Then, When } from '@cucumber/cucumber';
import { ApiPage } from '../../../src/pages/api.page';
import { BddWorld } from '../support/world';

Given('I have an API client for the JSONPlaceholder service', async function (this: BddWorld) {
  this.apiPage = new ApiPage(this.context.request);
});

When(
  'I create a post with title {string} and body {string}',
  async function (this: BddWorld, title: string, body: string) {
    this.apiResponse = await this.apiPage.createPost(title, body);
  }
);

Then('the create response status should be {int}', async function (this: BddWorld, expectedStatus: number) {
  await this.apiPage.expectStatus(this.apiResponse, expectedStatus);
});

Then('the created post title should be {string}', async function (this: BddWorld, expectedTitle: string) {
  await this.apiPage.expectTitle(this.apiResponse, expectedTitle);
});

When('I fetch the existing post with id {int}', async function (this: BddWorld, postId: number) {
  this.apiResponse = await this.apiPage.getPost(postId);
});

Then('the fetch response status should be {int}', async function (this: BddWorld, expectedStatus: number) {
  await this.apiPage.expectStatus(this.apiResponse, expectedStatus);
});

Then('the fetched post id should be {int}', async function (this: BddWorld, expectedId: number) {
  await this.apiPage.expectId(this.apiResponse, expectedId);
});

When(
  'I update the existing post with id {int} using title {string} and body {string}',
  async function (this: BddWorld, postId: number, title: string, body: string) {
    this.apiResponse = await this.apiPage.updatePost(postId, title, body);
  }
);

Then('the update response status should be {int}', async function (this: BddWorld, expectedStatus: number) {
  await this.apiPage.expectStatus(this.apiResponse, expectedStatus);
});

Then('the updated post title should be {string}', async function (this: BddWorld, expectedTitle: string) {
  await this.apiPage.expectTitle(this.apiResponse, expectedTitle);
});

When('I delete the existing post with id {int}', async function (this: BddWorld, postId: number) {
  this.apiResponse = await this.apiPage.deletePost(postId);
});

Then('the delete response status should be {int}', async function (this: BddWorld, expectedStatus: number) {
  await this.apiPage.expectStatus(this.apiResponse, expectedStatus);
});

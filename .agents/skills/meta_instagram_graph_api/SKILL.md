---
name: meta_instagram_graph_api
description: Guidelines and cheatsheet for using the Meta Instagram Graph API (Content Publishing API) for auto-posting and token management.
---

# Meta Instagram Graph API Guidelines

When working with the Meta Instagram Graph API (`graph.facebook.com/v<VERSION>/`) for Content Publishing, adhere to the following strict requirements:

## 1. Account and Permission Requirements
- **Account Linkage**: The Instagram Professional/Business account **must** be linked to a Facebook Page. Standalone accounts cannot use this API.
- **Required Scopes**: Generating an access token requires at least: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, and `pages_read_engagement`.
- **OAuth Consent**: During token generation, the user must explicitly select/check the linked Facebook Page in the authorization popup. If they skip this, API calls will fail with `Object with ID <ID> does not exist, cannot be loaded due to missing permissions`.

## 2. Token Exchange & Page Access Tokens
- You **cannot** publish media directly using a User Access Token.
- Before publishing, you must exchange the User Access Token for a **Page Access Token**.
- **How to fetch**: 
  Make a `GET` request to `https://graph.facebook.com/v<VERSION>/me/accounts?fields=instagram_business_account,access_token&access_token=<USER_TOKEN>`.
  Find the page where `page.instagram_business_account.id === targetIgUserId` and use its `access_token`.

## 3. Request Formatting
- **Authorization Header**: Always pass the Page Access Token in the HTTP headers as `Authorization: Bearer <PAGE_TOKEN>`.
- **NEVER in JSON Body**: Do not pass `access_token` inside the JSON `body` payload for `POST` requests. Doing so during the media container creation step (`POST /{ig-user-id}/media`) will result in an obscure rejection: `OAuthException error_subcode 2207032 (Create media fail)`.

+++
title = "Chaining vulnerabilities for XSS on TikTok.com"
date = 2022-10-09
description = "A writeup of a security vulnerability in the TikTok platform, leading to styling and image injection."

slug = "tiktok-xss"

[taxonomies]
tags = ["vulnerability", "writeup", "security"]

[extra]
comments = true
hidden = true
+++

## TL;DR
I found a way to inject arbitrary CSS and images into the TikTok platform, leading to XSS. This was possible due to a combination of a few different vulnerabilities, including unsafe redirects and a lack of input validation. 

It recieved a $257 bounty from Tiktok with a CVSS score of `4.3` (Medium).

## Introduction
TikTok is a social media platform that allows users to create and share short videos. It is one of the most popular social media platforms in the world, with over 1.5 billion users.

As a user myself, I was interested in checking if there were any vulnerabilities in the platform. Such a large platform is bound to have some security issues, and I was curious to see if I could find any.

## Exploring the platform
The [tiktok.com website](https://tiktok.com) was my main target, as finding vulnerabilities in the mobile app would be much more difficult. 

I started by checking out the different UX flows on the website, especially those related to security. I noticed that when you're on a user's profile with external links, the buttons for those links don't actually link to the external websites. Instead, they resolve to a security warning page, which is shown below:

{% figure(src="tiktok-security-warning.png", alt="A screenshot of the security warning page. It says: You're about to open an external website. Be cautious and keep your personal information sage.") %}
    The [security warning page](https://www.tiktok.com/link/v2?aid=1988&lang=en&scene=bio_url&target=https%3A%2F%2Fsticky.com.au%2Fsocials).
{% end %}

This page got my attention because it takes URL query parameters and inserts it directly into the HTML, which makes it a prime target for script injection. We can see that the `aid` and `target` parameters are used to populate the HTML, as shown below:

{% figure(src="warning-html.png", alt="A screenshot of the security warning page source code. It shows the HTML with the aid and target parameters.") %}
    The [security warning page](https://www.tiktok.com/link/v2?aid=1988&lang=en&scene=bio_url&target=https%3A%2F%2Fsticky.com.au%2Fsocials) source code. Lines with red arrows show where the `aid` and `target` parameters are used.
{% end %}

I then tried to edit these parameters to see what I could inject.

## Parameter fuzzing

Fuzzing refers to inserting an assortment of specially-crafted values into the inputs of a system in order to find an unexpected behaviour.

In this case, my end goal was to insert HTML into the page, so I tried various inputs, such as:
- `<h1>test</h1>`
- `"><script>alert(1)</script>`

However, it turned out that TikTok sanitized these inputs, so (for example) `""><script>alert(1)</script>` was converted to `&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;`.

I did discover, however, the following interesting behaviours: 

### 1. Allowlist of common domains
There was some common domains, that if linked to via the `?url` query parameter, would be allowed to be opened. The page would not show an interstitial warning, and would instead return a HTTP 301 redirect to the linked domain.

In testing, I found that the following domains were allowed:
- `tiktok.com`
- `githubusercontent.com`
- `googleusercontent.com`
- `cloudfront.com`
- `tiktokcdn.com`
- `tiktokv.com`
- `cdnjs.cloudflare.com`

This made sense, because these domains are probably used to load the website's assets and the user's videos, so they would need to be allowlisted.

### 2. Different page on malformed URLs
If the `url` parameter was set to `javascript:alert(1)` (example used in testing), the page would instead have slightly different HTML, instead showing a [error notice](https://www.tiktok.com/link/v2?aid=1988&lang=en&scene=bio_url&target=javascript:1).

In the HTML code of *this* page, I found this following critical line: `<link rel="stylesheet" type="text/css" href="./static/css/1988.css">`, where `1988` was the `?aid=` parameter. This meant that I could inject CSS into the page, which would allow me to style the page however I wanted.

However, the URL had to be on the tiktok.com domain, so the maximum impact I could have was serving some CSS that was already on the domain, and not arbitrary CSS. So, I needed to escalate this vulnerability to something more powerful.

## Escalating the vulnerability

So, I needed to find a way to refer to a URL under the tiktok.com namespace, while actually linking to an arbitrary domain. I thought to myself: "That sounds like a job for a redirect!" And as luck would have it, I'd already found that we could get a 301 redirect to a common domain, so I thought I'd try to use that.

Let's go through the allowlisted domains, to see if we can feasibly use them to host anything.
- `tiktok.com` - This is the domain we're on, so we can't use this.
- `githubusercontent.com` - We could use this to host our payload, except that browser CORB (Cross-Origin Read Blocking) would prevent us from reading the response (see [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP)) for more info).
- `googleusercontent.com` - Same as above, except it would be a lot harder to host our payload here (probably through upload to Google Drive and then finding the raw download URL).
- `cloudfront.com` - **This is a CDN, so we could use it to host our payload!**

## Exploitation

I created an S3 bucket, added a CloudFront distribution, and uploaded a file to the bucket. The file was a CSS file that simply turned the background of the page red, to verify that it worked.

Then, I created the redirect URL. I set the `?aid` parameter to something like the following: `../../../../../link/v2?lang=en&scene=bio_url&aid=1988&target=https%3A//d3lae8h63hciuw.cloudfront.net/payloadcss1.css`. Then, I simply constructed the full malicious URL through the use of a simple script like the one below:

```python
from urllib.parse import quote

base_final = "https://www.tiktok.com/link/v2?lang=en&scene=bio_url&target=javascript://whatever&aid="
base_initial = "../../../../../link/v2?lang=en&scene=bio_url&aid=1988&target="

url = input("Payload URL: ")
tlink = base_initial + quote(url)
final_link = base_final + quote(tlink + "#")
print(final_link)
```

This script would take the payload URL as input, and then construct the full malicious URL. The `#` at the end of the URL is important, because it tells the browser to ignore the rest of the URL, and only load the CSS file.

I then sent the link to a friend, and they were able to see the red background on the page.

{% figure(src="tiktok-exploit.png", alt="A screenshot of the TikTok security warning page with a red background.") %}
    The [security warning page](https://www.tiktok.com/link/v2?aid=1988&lang=en&scene=bio_url&target=https%3A%2F%2Fsticky.com.au%2Fsocials) with a red background.
{% end %}

## Conclusion

I immediately reported this vulnerability to TikTok, and they fixed it within a few days. It was a fun vulnerability to find, and I'm glad I was able to find it before it was abused.

This vulnerability would have allowed for the construction of arbitrary phishing pages that were 100% on the tiktok.com domain, bypassing many of the checks that users would do to verify the authenticity of the page. 

This would have been a very powerful attack vector, especially because almost 60% of TikTok users are teens/Gen Z (source: [here](https://wallaroomedia.com/blog/social-media/tiktok-statistics/)) and may not be as security-aware as older users.

It got a CVSS rating of `4.3` (Medium), which is a bit low for a XSS vulnerability, but I think it's because the impact is limited to the page itself (through CSS only), and not the whole website. The bounty was $257 USD.

Thanks to [TikTok](https://www.tiktok.com/) for fixing this vulnerability so quickly, and for the bounty, as well as [HackerOne](https://hackerone.com/) for running the program.
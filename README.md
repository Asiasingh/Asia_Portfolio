# Asia Masoom · Portfolio

A one-page portfolio for video editing, photo editing and content creation. It's plain HTML, CSS and JS, with nothing to install. Double-click `index.html` to open it in your browser.

```
index.html          all the text and sections
css/styles.css      colors, fonts, layout
js/main.js          video player, hover previews, photo viewer, contact form
assets/videos/      the reels (vertical 9:16 .mp4)
assets/covers/      a cover picture for each reel (540×960 .jpg)
assets/photos/      photo gallery
assets/portraits/   the three photos of you at the top (originals/ keeps the full-size files)
```

## Add a new video

1. Put the `.mp4` in `assets/videos/`. Use a simple name with no spaces or emoji, like `diwali-reel.mp4`.
2. Add a cover picture to `assets/covers/`, for example a screenshot of the best frame, cropped to 9:16.
3. In `index.html`, copy one `<figure>...</figure>` block in the VIDEO & CONTENT section and change the file names, title and duration.

Keep the total number of videos a multiple of 4 so the rows stay full. Instead of a file, `data-video` can also be a YouTube Shorts, TikTok or Instagram Reel link.

## Add a new photo

Put it in `assets/photos/` and copy one `<button class="shot">...</button>` block in the PHOTO section.

## Book an Appointment

Visitors choose a service, date, time and meeting type, then press **Book on WhatsApp** or **Book by email**. Their request opens in WhatsApp (or their email app) with every detail filled in and addressed to you; they just press send. No server or extra account is needed.

To change the services or time slots, edit the BOOK AN APPOINTMENT section in `index.html`. Your WhatsApp number and email come from the `data-` attributes in the "Prefer to reach out directly?" block.

## Put it online with Vercel (free)

1. Push this folder to a GitHub repository.
2. On vercel.com, click **Add New → Project**, import the repository, and leave the framework set to **Other**. No build command is needed.
3. Click **Deploy**. Every later push to GitHub updates the live site automatically.

`vercel.json` adds browser caching for images and videos, plus basic security headers.

## Privacy

- `.env` is listed in `.gitignore`, so it never reaches GitHub. Keep any future passwords or API keys there.
- Your email and phone are shown on the page on purpose, so they are public. In the page's code they're stored in pieces and put together by `js/main.js`, which stops most spam bots from collecting them.
- `assets/portraits/originals/` (your full-size photos) is also git-ignored and won't be uploaded.

The videos add up to about 45 MB. Both hosts handle that fine, but if the site ever feels slow, compress the videos with HandBrake (free) before uploading.

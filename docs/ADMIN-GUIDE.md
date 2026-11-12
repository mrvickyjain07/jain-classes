# Jain Classes – Administrator Guide

For Prof. Madhusudan Jain and authorised institute staff. No programming is needed for anything in this guide.

## The idea in one minute

- **PDFs** are kept in the official Jain Classes **Google Drive**.
- The **dashboard** tells the website which note belongs to which topic.
- Students see only what is marked **Published**. Everything is free; students never log in.

Content is arranged like this:

**Examination → Course → Subject → Topic → Study material**

Example: MPSC → MPSC Rajyaseva → Indian Polity → Fundamental Rights → "Fundamental Rights Notes.pdf"

## 1. Log in

1. Open `https://<your-website>/admin/login`.
2. Enter the admin email and password. Click **Sign in**.
3. After five wrong attempts the login is locked for 15 minutes.
4. When you finish, click **Logout** (bottom of the left menu). You are signed out automatically after 8 hours.

On a phone, open the menu with the ☰ button at the top right.

## 2. Add a new course

1. Menu > **Courses** > **Add course**.
2. Fill in **Course title**, choose the **Examination category** (UPSC, MPSC, Other Competitive Exams, or type a new one) and write a short **Description**.
3. **Display order**: smaller numbers appear first.
4. Leave **Web address (slug)** empty; it is created from the title.
5. Keep **Published** ticked to show the course on the website. Click **Add course**.

Please do not write fees, admission dates or results unless they are correct and current.

## 3. Add subjects

1. Menu > **Subjects** > **Add subject**.
2. Choose the **Course**, type the **Subject title** (for example Indian Polity). Click **Add subject**.

The same subject name can be used in different courses. Add it once for each course.

## 4. Add topics

1. Menu > **Topics** > **Add topic**.
2. Choose the **Subject** (shown as Course › Subject), type the **Topic title**. Click **Add topic**.

Tip: choose a subject in the filter box first; the new topic will be placed in that subject automatically.

## 5. Upload a PDF to Google Drive

1. Open Google Drive with the official Jain Classes account.
2. Open the correct folder, for example `Jain Classes – Study Materials > MPSC Rajyaseva > Polity`.
3. Click **New > File upload** and choose the PDF.

## 6. Copy the Drive link

1. Right-click the file > **Share > Share**.
2. Under **General access** choose **Anyone with the link**, role **Viewer**.
3. Click **Copy link**, then **Done**.

Time-saver: set **Anyone with the link – Viewer** once on the main `Jain Classes – Study Materials` folder. Every file you put inside is then shared automatically, and you only need **Copy link**.

Remember: anyone who has this link can open the file. Only upload notes that are meant to be free and public.

## 7. Add the study material to the dashboard

1. Menu > **Study Materials** > **Add study material**.
2. Choose **Examination**, **Course**, **Subject** and **Topic**.
3. Type the **Document title** and, if you like, a short **Description**.
4. Paste the link into **Google Drive URL**. A green "Valid Google Drive link" message appears. Click **Preview link** to check that the right file opens.
5. Tick **Featured** if the note should be highlighted on the Study Materials page.
6. Click **Add study material**.

The note is on the website immediately. A topic can have as many notes as you like.

There is no upload button on the website on purpose. Files always stay in Google Drive.

## 8. Publish, unpublish, edit, delete

In every list, each row has three buttons on the right:

| Button | What it does |
|---|---|
| Eye | **Publish / Unpublish**. Unpublished items are hidden from students but kept in the dashboard. |
| Pencil | **Edit**. Use this to change a title or **replace the Drive link**. |
| Bin | **Delete** permanently. The PDF in Google Drive is not deleted. |

- Unpublishing a course, subject or topic also hides everything inside it.
- A course, subject or topic can be deleted only when it is empty. If you just want to hide it, unpublish it.
- If you replace a PDF with a newer version in Drive using **File information > Manage versions**, the link stays the same and nothing needs to change on the website.

## 9. Add current affairs

1. Menu > **Current Affairs** > **Add article**.
2. Fill in **Title**, **Category**, **Relevant examination**, a two or three sentence **Summary** and the **Full content**.
3. Formatting in the content box:
   - Leave a blank line between paragraphs.
   - Start a line with `## ` for a heading.
   - Start a line with `- ` for a bullet point.
4. **Source links**: one link per line, starting with `https://`.
5. Tick **Published** when it is ready. The date is set to today unless you choose another date.

Always write in your own words and give the source. Do not copy newspaper articles in full.

## 10. Update contact information

Menu > **Website Settings** > **Institute and contact**. Change the phone number, WhatsApp number (with country code, for example `917558536630`), email or location. Click **Save settings**. All WhatsApp buttons on the website use the new number immediately.

## 11. Update homepage and About content

Menu > **Website Settings**:

- **Homepage**: main headline, subtitle, description and the "Welcome to Jain Classes" text.
- **About section**: About Jain Classes, vision, mission, teaching philosophy, educational approach, professor introduction and guidance approach.
- **Social media links**: paste the full link (starting with `https://`). Empty fields are hidden on the website.

Write only what you want published. The website never adds qualifications, results or achievements on its own.

## 12. Changing the logo or photograph

The logo and the professor's photograph are files inside the website (`public/images`). To change them, send the new file to your developer, who replaces the file and redeploys. The paths under **Images and search engines** should normally be left as they are.

## If something goes wrong

- **Red message when saving**: read the message under the highlighted field, correct it and save again.
- **"Google Sheets is busy"**: wait one minute and try again.
- **A student says a PDF asks for access**: the file is not shared as "Anyone with the link – Viewer". Fix the sharing in Google Drive; nothing needs to change on the website.
- **"Invalid Drive link" badge in the list**: click the pencil and paste the link again.
- **Forgot the password**: ask your developer to run `npm run admin:create` and update the password in Vercel.

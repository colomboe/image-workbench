# Playing with image generative AI

I wanted to try out gpt-image-1, OpenAI’s new model for image generation. It’s rare that I need to generate images for a project (sometimes for fun with my kids), and while the free ChatGPT plan feels too limited for occasional image work, I don’t need a full monthly subscription either.
I also looked online for simple tools that directly use the gpt-image-1 API and support all its features, but I couldn’t find anything that fit my needs.

When you have to produce multiple images with consistent characters and style, a chat-based UI can feel a bit restrictive. So I decided to build a small tool that talks directly to the OpenAI image-generation API. The interface is a very simple node-based editor that lets you link images together—so you can reliably reuse characters or environments across multiple prompts. I’ve also added inpainting support, even though gpt-image-1 doesn’t always honor an inpainting mask perfectly.

If you’re curious, the source code is on my GitHub profile, and you can try it out here: https://msec.it/image-workbench

A few things you’ll need to know before getting started:

 - The tool is still pretty rough around the edges—there are a lot of UI/UX improvements I’d like to add.
 - You should provide your own OpenAI API key enabled for the gpt-image-1 model (click the key icon in the tool to set it, it will be stored locally in your browser’s local storage).
 - Because the tool runs entirely in your browser (it’s serverless), you have to click “New project” first and choose an empty local folder where it will save your files and images.

Fell free to test and use it if you think it can be useful for you. And let me know if you have any feedback. Anyway, consider that this is just a little side-project done in my very very limited free time, so I’m not able to promise you any kind of support of future development.

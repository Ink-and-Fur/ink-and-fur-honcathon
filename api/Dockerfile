FROM denoland/deno

EXPOSE 8000

WORKDIR /app

ADD deno.json .
ADD deno.lock .
ADD src/deps.ts src/deps.ts


RUN deno cache --lock=deno.lock src/deps.ts

ADD . .

CMD ["task", "start"]

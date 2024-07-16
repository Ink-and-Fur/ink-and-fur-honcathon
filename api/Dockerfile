FROM denoland/deno

EXPOSE 8000

WORKDIR /app

ADD . /app

RUN deno cache src/index.deno.ts

CMD ["run", "--allow-net", "src/index.deno.ts"]
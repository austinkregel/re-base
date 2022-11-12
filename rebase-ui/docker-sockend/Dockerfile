#A lightweight node image
FROM kregel/rebase:latest
WORKDIR /app
RUN ls -alh /app

COPY start-container /start-container
RUN chmod +x /start-container
ENTRYPOINT ["/start-container"]

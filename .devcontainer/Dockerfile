# FANZ Development Container
FROM mcr.microsoft.com/devcontainers/typescript-node:20-bullseye

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        postgresql-client \
        redis-tools \
        curl \
        wget \
        unzip \
        git \
        build-essential \
        python3-pip \
        python3-dev \
        ffmpeg \
        imagemagick \
    && apt-get autoremove -y && apt-get clean -y

# Install mise for tool version management
RUN curl https://mise.run | sh
ENV PATH="/home/vscode/.local/bin:$PATH"

# Install global Node.js tools
RUN npm install -g pnpm@9.12.0 tsx nodemon

# Install Python packages for AI/ML
RUN pip3 install --no-cache-dir \
    openai \
    anthropic \
    tensorflow \
    torch \
    transformers \
    pillow \
    opencv-python

# Install Go tools
RUN wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz \
    && rm go1.21.5.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:$PATH"

# Install Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# Install development CLI tools
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install -y gh

# Setup user environment
USER vscode

# Install Rust for high-performance components
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/vscode/.cargo/bin:$PATH"

# Create workspace directories
RUN mkdir -p /home/vscode/.local/share/mise \
    && mkdir -p /workspace/{apps,packages,services,env}

# Set working directory
WORKDIR /workspace

# Copy mise configuration
COPY .mise.toml /workspace/.mise.toml

# Install mise tools
RUN mise install

EXPOSE 3000 5000 8080 5432 6379
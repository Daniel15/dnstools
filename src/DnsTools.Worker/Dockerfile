FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

RUN apt-get -y update && \
  apt-get install -y --no-install-recommends \
    iputils-ping \
	traceroute \
	mtr-tiny \
  && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0-bookworm-slim AS build
# Install clang/zlib1g-dev dependencies for publishing to native
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    clang \
	zlib1g-dev \
	libcurl4-openssl-dev
ARG BUILD_CONFIGURATION=Release
WORKDIR /
COPY ["src/DnsTools.Worker/DnsTools.Worker.csproj", "app/src/DnsTools.Worker/"]
RUN dotnet restore "app/src/DnsTools.Worker/DnsTools.Worker.csproj"
COPY . app/
WORKDIR "/app/src/DnsTools.Worker"
RUN dotnet build "DnsTools.Worker.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
RUN dotnet publish "DnsTools.Worker.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=true

FROM mcr.microsoft.com/dotnet/runtime-deps:8.0-bookworm-slim AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["./DnsTools.Worker"]
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
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

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/DnsTools.Worker/DnsTools.Worker.csproj", "src/DnsTools.Worker/"]
RUN dotnet restore "src/DnsTools.Worker/DnsTools.Worker.csproj"
COPY . .
WORKDIR "/src/src/DnsTools.Worker"
RUN dotnet build "DnsTools.Worker.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "DnsTools.Worker.csproj" -c $BUILD_CONFIGURATION -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DnsTools.Worker.dll"]
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

RUN apt-get -y update && \
  apt-get install -y --no-install-recommends \
    iputils-ping \
  && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/core/sdk:3.0-buster AS build
WORKDIR /src
COPY ["src/DnsTools.Worker/DnsTools.Worker.csproj", "src/DnsTools.Worker/"]
RUN dotnet restore "src/DnsTools.Worker/DnsTools.Worker.csproj"
COPY . .
WORKDIR "/src/src/DnsTools.Worker"
RUN dotnet build "DnsTools.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DnsTools.Worker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DnsTools.Worker.dll"]
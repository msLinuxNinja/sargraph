# What is this?
Sargraph is a tool that allows users to visualize system performance data collected by the sar (system activity reporter) command with visually pleasing graphs. The utility takes the sar output (txt) data and generates graphical representations of various system metrics, such as:

- CPU usage
- Memory usage 
- Disk activity

These graphs can help users quickly identify patterns and trends in their system's performance over time, making it easier to identify issues and optimize performance.

Sargraph runs entirely on the browser and parsing occurs locally, as such no data is uploaded to any location, keeping PII (such as hostnames) local.

# Motivation

Sysstat is a great tool to review historical performance data on Linux systems, yet it is saved as raw text making it hard to fully see patterns around performance.

Sargraph helps review sar files quickly, making performance analysis faster, specially for new Linux Users.

Lastly, existing tools to graph sar data are either too old or files need to be uploaded somewhere. The main motivation is keeping all PII local by having the browser run all the parsing.


# Design philosophy
- Must be beautiful, use modern frameworks for UI (React)⚛️ and chartjs2 for charts 🌈.
- No PII 📵, data is kept within the browser.
- Easy to use👍🏻, numbers are shown in human readable format. (i.e. 1GB vs 1000000KB)

# Usage

There are 2 main ways the application can be used:
1. Use the docker image. For example, from WSL 2 with docker installed run the command `docker run -d --name sargraph -p 8080:80 gjarllarhorn/sargraph`
2. Clone the repo and run `npm install -f` and `npm run` (**slower, not recommended**, also node v16+ needs to be isntalled).


Sargraph consumes the sar generated by sysstat files normally found under `/var/log/sa` and generates easy to read graphs for the different metrics.

To use, drag & drop or click to select a sar file.


![](https://github.com/msLinuxNinja/sargraph/blob/main/howto.gif)


# To Do
- ✅Include other metrics like network, swap.
- ✅Enhance performance on larger datasets.
- ✅Include tips on the different metrics.
- ✅Learn to code and make good applications.

# Feedback

Feel free to open an [Issue](https://github.com/msLinuxNinja/sargraph/issues) and leave feedback, or head to the [Discussions](https://github.com/msLinuxNinja/sargraph/discussions) section if there’s any question.

# Contributing

Not going to lie that my code isn’t great… As such if anyone wants to help make this better, I’d love to accept any [PRs](https://github.com/msLinuxNinja/sargraph/pulls).


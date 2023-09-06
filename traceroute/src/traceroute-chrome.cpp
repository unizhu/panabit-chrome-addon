#include <iostream>
#include <cstdio>
#include <cstring>
#include <cstdint>
#include <sstream>

void sendMessageToChromeExtension(const std::string &message) {
    // First, send the size of the message
    uint32_t size = message.size();
    fwrite(&size, sizeof(uint32_t), 1, stdout);

    // Next, send the actual message
    fwrite(message.c_str(), sizeof(char), size, stdout);
    fflush(stdout);
}

void traceroute(const std::string &target) {
    std::string command = "traceroute " + target;
    char buffer[128];

    FILE *pipe = popen(command.c_str(), "r");
    if (!pipe) {
        sendMessageToChromeExtension("Failed to run traceroute.");
        return;
    }

    while (!feof(pipe)) {
        if (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
            sendMessageToChromeExtension(buffer);
        }
    }
    pclose(pipe);
}

int main() {
    // Read the message length
    uint32_t messageSize;
    fread(&messageSize, sizeof(uint32_t), 1, stdin);

    // Read the actual message
    std::string message;
    message.resize(messageSize);
    fread(&message[0], sizeof(char), messageSize, stdin);

    traceroute(message);

    return 0;
}
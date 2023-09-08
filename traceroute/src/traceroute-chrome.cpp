#include <iostream>
#include <string>
#include <cstdlib>
#include <array>

void sendNativeMessage(const std::string& message) {
    uint32_t len = message.size();
    std::array<char, 4> lenArr;
    lenArr[0] = len & 0xff;
    lenArr[1] = (len >> 8) & 0xff;
    lenArr[2] = (len >> 16) & 0xff;
    lenArr[3] = (len >> 24) & 0xff;
    std::cout.write(lenArr.data(), 4);
    std::cout << message;
}

int main() {
    std::cout << "";
    uint32_t length;
    std::cin.read(reinterpret_cast<char*>(&length), 4);

    std::string input(length, '\0');
    std::cin.read(&input[0], length);

    // Extract the domain from the input (here it's assumed to be the full input string)
    std::string domain = input;

    // Run traceroute
    FILE* pipe = popen(("traceroute " + domain).c_str(), "r");
    if (!pipe) {
        sendNativeMessage("Error: could not perform traceroute.");
        return 1;
    }

    // Read traceroute output line by line and send it to Chrome
    char buffer[128];
    while (fgets(buffer, 128, pipe)) {
        sendNativeMessage(buffer);
    }

    pclose(pipe);
    return 0;
}
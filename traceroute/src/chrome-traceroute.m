#import <Foundation/Foundation.h>

void sendNativeMessage(NSString *message) {
    uint32_t len = (uint32_t)[message lengthOfBytesUsingEncoding:NSUTF8StringEncoding];
    fwrite(&len, sizeof(uint32_t), 1, stdout);
    const char *utf8Message = [message UTF8String];
    fwrite(utf8Message, sizeof(char), len, stdout);
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        while (true) {
            uint32_t length;
            if (fread(&length, sizeof(uint32_t), 1, stdin) != 1) {
                break; // Exit loop if we cannot read the length (likely due to closed stdin)
            }

            NSMutableData *data = [NSMutableData dataWithLength:length];
            fread([data mutableBytes], sizeof(char), length, stdin);

            NSString *input = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            NSString *domain = [input stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

            FILE *pipe = popen([[NSString stringWithFormat:@"traceroute %@", domain] UTF8String], "r");
            if (!pipe) {
                sendNativeMessage(@"Error: could not perform traceroute.");
                continue;  // If traceroute fails, continue to the next iteration rather than exiting
            }

            char buffer[128];
            while (fgets(buffer, 128, pipe)) {
                sendNativeMessage([NSString stringWithUTF8String:buffer]);
            }

            pclose(pipe);
        }
    }
    return 0;
}
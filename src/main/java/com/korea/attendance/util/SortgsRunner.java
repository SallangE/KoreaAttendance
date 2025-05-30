package com.korea.attendance.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SortgsRunner {

    public static List<Map<String, Object>> runSortgs(String keyword, int nresults) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "sortgs", keyword, "--nresults", String.valueOf(nresults)
            );
            pb.redirectErrorStream(true);  // stderr → stdout 병합

            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), "UTF-8"));

            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[Sortgs] " + line); // 콘솔에 바로 출력
                output.append(line);
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Sortgs 실행 실패. exit code: " + exitCode + "\n출력 내용:\n" + output);
            }

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(output.toString(), new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Sortgs 실행 중 오류 발생:\n" + e.getMessage(), e);
        }
    }
}

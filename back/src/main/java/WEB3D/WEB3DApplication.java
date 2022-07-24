package WEB3D;

import WEB3D.domain.Authority;
import WEB3D.domain.Instruction;
import WEB3D.domain.Problem;
import WEB3D.domain.User;
import WEB3D.repository.AuthorityRepository;
import WEB3D.repository.ProblemRepository;
import WEB3D.repository.UserRepository;
import com.corundumstudio.socketio.SocketIOServer;
import org.dom4j.Node;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.sql.Array;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;


@SpringBootApplication
public class WEB3DApplication {

    public static void main(String[] args) {
        SpringApplication.run(WEB3DApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataLoader(UserRepository userRepository, AuthorityRepository authorityRepository, PasswordEncoder passwordEncoder, ProblemRepository problemRepository) {
        return new CommandLineRunner() {
            @Override
            public void run(String... args) throws Exception {
                // Create authorities if not exist.
                getOrCreateAuthority("User", authorityRepository);
                Authority adminAuthority = getOrCreateAuthority("Admin", authorityRepository);

                // Create a SuperLibrarian
                if (userRepository.findByUsername("admin") == null) {
                    User admin = new User(
                            "admin",
                            passwordEncoder.encode("password"),
                            new HashSet<>(Collections.singletonList(adminAuthority))
                    );
                    userRepository.save(admin);
                }

                //initiate problems
                initProblem(problemRepository);


            }

            private Authority getOrCreateAuthority(String authorityText, AuthorityRepository authorityRepository) {
                Authority authority = authorityRepository.findByAuthority(authorityText);
                if (authority == null) {
                    authority = new Authority(authorityText);
                    authorityRepository.save(authority);
                }
                return authority;
            }
        };
    }

    private void initProblem(ProblemRepository problemRepository) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = factory.newDocumentBuilder();
            Document doc = db.parse("./src/main/resources/ProblemConfig.xml");
            NodeList problemList = doc.getElementsByTagName("problem");
            for (int i = 0; i < problemList.getLength(); i++) {
                NodeList childNodes = problemList.item(i).getChildNodes();
                List<Integer> nodeIndex = new ArrayList<>();
                for (int j = 0; j < childNodes.getLength(); j++) {
                    if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
                        nodeIndex.add(j);
                    }
                }
                String title = childNodes.item(nodeIndex.get(0)).getTextContent();
                String description = childNodes.item(nodeIndex.get(1)).getTextContent();
                int stage = Integer.parseInt(childNodes.item(nodeIndex.get(2)).getTextContent());
                int number = Integer.parseInt(childNodes.item(nodeIndex.get(3)).getTextContent());
                String[] instructionArray = childNodes.item(nodeIndex.get(4)).getTextContent().split(";");
                List<Instruction> instructions = new ArrayList<>();
                for (String instruction : instructionArray) {
                    instructions.add(new Instruction(instruction));
                }
                String input = childNodes.item(nodeIndex.get(5)).getTextContent();
                String output = childNodes.item(nodeIndex.get(6)).getTextContent();
                String memory = childNodes.item(nodeIndex.get(7)).getTextContent();
                String worldInfo = childNodes.item(nodeIndex.get(8)).getTextContent();

                if (problemRepository.findByStageAndNumber(stage, number) != null) {
                    continue;
                }
                Problem problem = new Problem(stage, number, title, description, instructions, input, output, memory, worldInfo);
                problemRepository.save(problem);
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}


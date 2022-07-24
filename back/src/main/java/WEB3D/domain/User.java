package WEB3D.domain;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.util.*;


@Entity
public class User implements UserDetails {

    private static final long serialVersionUID = -6140085056226164016L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    private String modelName;

    @ManyToMany(cascade = CascadeType.MERGE, fetch = FetchType.EAGER)
    private Set<Authority> authorities = new HashSet<>();

    @OneToMany(targetEntity = Solution.class, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Solution> solutions = new ArrayList<>();


    public User() {
    }

    public User(String username, String password, Set<Authority> authorities){
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    public User(String username, String password, Set<Authority> authorities, String modelName) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.modelName = modelName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Long getId() {
        return id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getAuthoritiesString() {
        Set<String> temp = new HashSet<>();
        for (Authority auth : authorities) {
            temp.add(auth.getAuthority());
        }
        return temp;
    }

    public List<Solution> getSolutions() {
        return solutions;
    }

    public void addSolution(Solution solution) {
        this.solutions.add(solution);
    }

    public String getModelName() {
        return modelName;
    }
}

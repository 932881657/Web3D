package WEB3D.controller.request;


public class ChangePasswordRequest {

    private String password;
    private String rePassword;
    private String token;

    public ChangePasswordRequest(String password, String rePassword, String token) {
        this.password = password;
        this.rePassword = rePassword;
        this.token = token;
    }

    public String getPassword() {
        return password;
    }

    public String getRePassword() {
        return rePassword;
    }

    public String getToken() {
        return token;
    }
}

import java.sql.*;

public class Assignment2 {
    
    // A connection to the database  
    Connection connection;
  
    // Statement to run queries
    Statement sql;
  
    // Prepared Statement
    PreparedStatement ps;
  
    // Resultset for the query
    ResultSet rs;
  
    //CONSTRUCTOR
    Assignment2(){
    }
  
    //Using the input parameters, establish a connection to be used for this session. Returns true if connection is sucessful
    public boolean connectDB(String URL, String username, String password){
        try{
            connection = connection = DriverManager.getConnection(URL, username, password);
            
            return true;
        }
        catch(SQLException e){
            return false;
        }

        //System.out.println(connection);
        return false;
    }
  
    //Closes the connection. Returns true if closure was sucessful
    public boolean disconnectDB(){
        try{
            connection.close();
            return true;   
        }
        catch(SQLException e) {
            return false;
        }
        
        return false;    
    }
    
    public boolean insertPlayer(int pid, String pname, int globalRank, int cid) {
        try{
            sql = connection.createStatement(); 
            String sqlText;
            sqlText = "INSERT INTO players( 
            VALUE ('"+pid+"','"+pid+"','"+pname+"',"+globalRank+",'"+cid+"')");
            sql.executeUpdate(sqlText);
            return true;
        }
        catch(SQLException e){
            return false;
        }
        return false;
    }   
  
    public int getChampions(int pid) {
	      return 0;  
    }
   
    public String getCourtInfo(int courtid){
        return "";
    }

    public boolean chgRecord(int pid, int year, int wins, int losses){
        try{ 
            sql = connection.createStatement(); 
            String sqlText;
            sqlText = "UPDATE jdbc_demo      " +
                                  "   SET wins = " + wins + " AND losses = " + losses +
                                  " WHERE  pid = " + pid + " AND year = " + year ; 
            sql.executeUpdate(sqlText);
            return true;
        }
        catch(SQLException e){
            
        }
        
        return false;
    }

    public boolean deleteMatcBetween(int p1id, int p2id){
        return false;        
    }
  
    public String listPlayerRanking(){
	      return "";
    }
  
    public int findTriCircle(){
        return 0;
    }
    
    public boolean updateDB(){
	      return false;    
    }  
}
